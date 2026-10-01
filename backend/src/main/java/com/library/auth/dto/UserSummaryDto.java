package com.library.auth.dto;

import com.library.user.domain.User;
import com.library.user.domain.UserRole;

import java.util.UUID;

public class UserSummaryDto {
    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private UserRole role;

    public UserSummaryDto() {}

    public UserSummaryDto(UUID id, String username, String email, String fullName, UserRole role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public static UserSummaryDto from(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
}
