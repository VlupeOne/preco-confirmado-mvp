package br.com.culturatech.precoconfirmado.shared.security;

import br.com.culturatech.precoconfirmado.user.domain.UserRole;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public record AuthenticatedUser(UUID id, UserRole role) {
    public static AuthenticatedUser from(Jwt jwt) {
        return new AuthenticatedUser(UUID.fromString(jwt.getSubject()), UserRole.valueOf(jwt.getClaimAsString("role")));
    }

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }
}
