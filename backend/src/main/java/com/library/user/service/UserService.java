package com.library.user.service;

import com.library.audit.service.AuditService;
import com.library.auth.dto.PasswordChangeRequest;
import com.library.common.exception.BusinessRuleException;
import com.library.common.exception.ConflictException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.user.domain.User;
import com.library.user.domain.UserRole;
import com.library.user.dto.CreateUserRequest;
import com.library.user.dto.UpdateUserRequest;
import com.library.user.dto.UserResponse;
import com.library.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(UserRole role, Boolean active, String search, Pageable pageable) {
        return userRepository.searchUsers(role, active, search, pageable)
                .map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id));
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request, UUID actorId, String actorUsername, String ipAddress) {
        if (userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
            throw new ConflictException("USER_ALREADY_EXISTS", "Username is already taken");
        }
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "Email address is already in use");
        }

        User user = new User(
                request.getUsername().toLowerCase().trim(),
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                request.getRole()
        );

        User saved = userRepository.save(user);

        auditService.recordEventAsync(actorId, actorUsername, "USER_CREATED", "USER", saved.getId().toString(), ipAddress,
                "Created user: " + saved.getUsername() + " with role " + saved.getRole());

        return UserResponse.from(saved);
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request, UUID actorId, String actorUsername, String ipAddress) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail().trim()) && userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "Email address is already in use");
        }

        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setFullName(request.getFullName().trim());
        user.setRole(request.getRole());

        User updated = userRepository.save(user);

        auditService.recordEventAsync(actorId, actorUsername, "USER_UPDATED", "USER", updated.getId().toString(), ipAddress,
                "Updated user profile for: " + updated.getUsername());

        return UserResponse.from(updated);
    }

    @Transactional
    public UserResponse updateUserStatus(UUID id, boolean active, UUID actorId, String actorUsername, String ipAddress) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id));

        if (user.getId().equals(actorId) && !active) {
            throw new BusinessRuleException("CANNOT_DEACTIVATE_SELF", "You cannot deactivate your own account");
        }

        user.setActive(active);
        User updated = userRepository.save(user);

        auditService.recordEventAsync(actorId, actorUsername, active ? "USER_ACTIVATED" : "USER_DEACTIVATED",
                "USER", updated.getId().toString(), ipAddress, "User status changed to " + (active ? "ACTIVE" : "INACTIVE"));

        return UserResponse.from(updated);
    }

    @Transactional
    public void changePassword(UUID targetUserId, PasswordChangeRequest request, UUID actorId, String actorUsername, boolean isAdmin, String ipAddress) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + targetUserId));

        if (!isAdmin && !user.getId().equals(actorId)) {
            throw new BusinessRuleException("UNAUTHORIZED_PASSWORD_CHANGE", "You can only change your own password");
        }

        if (!isAdmin) {
            if (request.getOldPassword() == null || !passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
                throw new BusinessRuleException("INVALID_OLD_PASSWORD", "Current password does not match");
            }
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.recordEventAsync(actorId, actorUsername, "PASSWORD_CHANGED", "USER", user.getId().toString(), ipAddress,
                "Password changed for user: " + user.getUsername());
    }
}
