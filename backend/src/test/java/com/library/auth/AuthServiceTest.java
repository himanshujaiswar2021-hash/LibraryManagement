package com.library.auth;

import com.library.audit.service.AuditService;
import com.library.auth.dto.AuthResponse;
import com.library.auth.dto.LoginRequest;
import com.library.auth.repository.RefreshTokenRepository;
import com.library.auth.security.JwtTokenProvider;
import com.library.auth.security.UserPrincipal;
import com.library.auth.service.AuthService;
import com.library.common.exception.UnauthorizedException;
import com.library.user.domain.User;
import com.library.user.domain.UserRole;
import com.library.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private HttpServletResponse httpServletResponse;

    private AuthService authService;
    private User testUser;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                authenticationManager,
                tokenProvider,
                refreshTokenRepository,
                userRepository,
                auditService,
                false
        );

        testUser = new User("admin", "admin@library.local", "hashedPassword", "System Administrator", UserRole.ADMIN);
        testUser.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Should successfully authenticate user and generate tokens")
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest("admin", "admin123");
        UserPrincipal principal = UserPrincipal.create(testUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(tokenProvider.generateAccessToken(authentication)).thenReturn("mock.jwt.token");
        when(tokenProvider.getAccessTokenExpirationSeconds()).thenReturn(900L);
        when(tokenProvider.getRefreshTokenExpirationMs()).thenReturn(604800000L);
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AuthResponse response = authService.login(request, httpServletResponse, "127.0.0.1");

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getUser().getUsername()).isEqualTo("admin");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.ADMIN);

        verify(httpServletResponse, times(1)).addCookie(any());
    }

    @Test
    @DisplayName("Should throw BadCredentialsException on invalid login")
    void shouldThrowExceptionOnInvalidLogin() {
        LoginRequest request = new LoginRequest("admin", "wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request, httpServletResponse, "127.0.0.1"))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void testBCryptHash() {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
            new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12);
        String hash = encoder.encode("admin123");
        System.out.println("GENERATED_BCRYPT_HASH=" + hash);
        assertThat(encoder.matches("admin123", hash)).isTrue();
    }
}
