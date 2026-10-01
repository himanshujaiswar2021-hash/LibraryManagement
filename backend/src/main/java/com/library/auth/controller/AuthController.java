package com.library.auth.controller;

import com.library.auth.dto.AuthResponse;
import com.library.auth.dto.LoginRequest;
import com.library.auth.dto.UserSummaryDto;
import com.library.auth.security.UserPrincipal;
import com.library.auth.service.AuthService;
import com.library.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Authentication and session endpoints")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Login with username and password", description = "Returns JWT access token and sets HttpOnly refresh token cookie")
    public ApiResponse<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        String clientIp = httpRequest.getRemoteAddr();
        AuthResponse response = authService.login(request, httpResponse, clientIp);
        return ApiResponse.success(response, "Login successful");
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Uses HttpOnly refresh token cookie to issue new access token")
    public ApiResponse<AuthResponse> refresh(
            @CookieValue(name = AuthService.REFRESH_COOKIE_NAME, required = false) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        String clientIp = httpRequest.getRemoteAddr();
        AuthResponse response = authService.refreshToken(refreshToken, httpResponse, clientIp);
        return ApiResponse.success(response, "Token refreshed successfully");
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Revokes refresh token and clears cookie")
    public ResponseEntity<Void> logout(
            @CookieValue(name = AuthService.REFRESH_COOKIE_NAME, required = false) String refreshToken,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        String clientIp = httpRequest.getRemoteAddr();
        authService.logout(
                refreshToken,
                httpResponse,
                principal != null ? principal.getId() : null,
                principal != null ? principal.getUsername() : null,
                clientIp
        );
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user", description = "Returns profile of authenticated user")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponse<UserSummaryDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserSummaryDto user = new UserSummaryDto(
                principal.getId(),
                principal.getUsername(),
                principal.getEmail(),
                principal.getFullName(),
                principal.getRole()
        );
        return ApiResponse.success(user, "Current user retrieved");
    }
}
