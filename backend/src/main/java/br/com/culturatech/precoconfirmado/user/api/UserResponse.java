package br.com.culturatech.precoconfirmado.user.api;

import br.com.culturatech.precoconfirmado.user.domain.UserEntity;
import br.com.culturatech.precoconfirmado.user.domain.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(UUID id, String name, String email, UserRole role,
                           boolean active, Instant createdAt, Instant updatedAt) {
    public static UserResponse from(UserEntity user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.isActive(), user.getCreatedAt(), user.getUpdatedAt());
    }
}
