package com.library.user.controller;

import com.library.auth.dto.PasswordChangeRequest;
import com.library.auth.security.UserPrincipal;
import com.library.common.dto.ApiResponse;
import com.library.common.dto.PagedResponse;
import com.library.user.domain.UserRole;
import com.library.user.dto.CreateUserRequest;
import com.library.user.dto.UpdateUserRequest;
import com.library.user.dto.UserResponse;
import com.library.user.dto.UserStatusRequest;
import com.library.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "System user CRUD and security management")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search users", description = "ADMIN only: paginated user list with filters")
    public ApiResponse<PagedResponse<UserResponse>> searchUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<UserResponse> page = userService.searchUsers(role, active, search, pageable);
        return ApiResponse.success(PagedResponse.from(page), "Users retrieved successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID", description = "ADMIN only: get specific user details")
    public ApiResponse<UserResponse> getUserById(@PathVariable UUID id) {
        return ApiResponse.success(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create user", description = "ADMIN only: create a new system administrator, librarian, or member account")
    public ApiResponse<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        UserResponse response = userService.createUser(request, principal.getId(), principal.getUsername(), httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "User created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user", description = "ADMIN only: update user details")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        UserResponse response = userService.updateUser(id, request, principal.getId(), principal.getUsername(), httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "User updated successfully");
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user active status", description = "ADMIN only: activate or deactivate user account")
    public ApiResponse<UserResponse> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UserStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        UserResponse response = userService.updateUserStatus(id, request.getActive(), principal.getId(), principal.getUsername(), httpRequest.getRemoteAddr());
        return ApiResponse.success(response, "User status updated successfully");
    }

    @PutMapping("/{id}/password")
    @Operation(summary = "Change user password", description = "ADMIN or account owner: update password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable UUID id,
            @Valid @RequestBody PasswordChangeRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        userService.changePassword(id, request, principal.getId(), principal.getUsername(), isAdmin, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success(null, "Password updated successfully"));
    }
}
