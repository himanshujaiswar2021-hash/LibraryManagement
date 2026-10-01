package com.library.auth.service;

import com.library.audit.service.AuditService;
import com.library.auth.domain.RefreshToken;
import com.library.auth.dto.AuthResponse;
import com.library.auth.dto.LoginRequest;
import com.library.auth.dto.UserSummaryDto;
import com.library.auth.repository.RefreshTokenRepository;
import com.library.auth.security.JwtTokenProvider;
import com.library.auth.security.UserPrincipal;
import com.library.common.exception.UnauthorizedException;
import com.library.user.domain.User;
import com.library.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    public static final String REFRESH_COOKIE_NAME = "refreshToken";

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final boolean cookieSecure;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            AuditService auditService,
            @Value("${app.jwt.cookie-secure:false}") boolean cookieSecure) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.cookieSecure = cookieSecure;
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response, String ipAddress) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!user.isActive()) {
            throw new UnauthorizedException("USER_INACTIVE", "Account is deactivated. Contact library administrator.");
        }

        String accessToken = tokenProvider.generateAccessToken(authentication);
        RefreshToken refreshToken = createRefreshToken(user);

        setRefreshTokenCookie(response, refreshToken.getTokenHash(), (int) (tokenProvider.getRefreshTokenExpirationMs() / 1000));

        auditService.recordEventAsync(user.getId(), user.getUsername(), "USER_LOGIN", "USER", user.getId().toString(), ipAddress, "Successful login");

        return new AuthResponse(accessToken, tokenProvider.getAccessTokenExpirationSeconds(), UserSummaryDto.from(user));
    }

    @Transactional
    public AuthResponse refreshToken(String tokenValue, HttpServletResponse response, String ipAddress) {
        if (tokenValue == null || tokenValue.isBlank()) {
            throw new UnauthorizedException("INVALID_REFRESH_TOKEN", "Refresh token is missing");
        }

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenValue)
                .orElseThrow(() -> new UnauthorizedException("INVALID_REFRESH_TOKEN", "Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new UnauthorizedException("REFRESH_TOKEN_EXPIRED", "Refresh token has expired or is revoked");
        }

        User user = refreshToken.getUser();
        if (!user.isActive()) {
            throw new UnauthorizedException("USER_INACTIVE", "User account is deactivated");
        }

        // Rotate token
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        RefreshToken newRefreshToken = createRefreshToken(user);
        setRefreshTokenCookie(response, newRefreshToken.getTokenHash(), (int) (tokenProvider.getRefreshTokenExpirationMs() / 1000));

        String newAccessToken = tokenProvider.generateAccessTokenFromUser(
                user.getId(), user.getUsername(), user.getRole().name(), user.getFullName(), user.getEmail());

        return new AuthResponse(newAccessToken, tokenProvider.getAccessTokenExpirationSeconds(), UserSummaryDto.from(user));
    }

    @Transactional
    public void logout(String tokenValue, HttpServletResponse response, UUID userId, String username, String ipAddress) {
        if (tokenValue != null && !tokenValue.isBlank()) {
            refreshTokenRepository.findByTokenHash(tokenValue).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }
        clearRefreshTokenCookie(response);
        if (userId != null) {
            auditService.recordEventAsync(userId, username, "USER_LOGOUT", "USER", userId.toString(), ipAddress, "User logged out");
        }
    }

    private RefreshToken createRefreshToken(User user) {
        String tokenHash = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        Instant expiry = Instant.now().plusMillis(tokenProvider.getRefreshTokenExpirationMs());
        RefreshToken refreshToken = new RefreshToken(user, tokenHash, expiry);
        return refreshTokenRepository.save(refreshToken);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String tokenValue, int maxAgeSeconds) {
        Cookie cookie = new Cookie(REFRESH_COOKIE_NAME, tokenValue);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(maxAgeSeconds);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }
}
