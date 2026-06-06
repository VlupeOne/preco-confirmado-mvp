package br.com.culturatech.precoconfirmado.auth.application;

import br.com.culturatech.precoconfirmado.auth.domain.RefreshTokenEntity;
import br.com.culturatech.precoconfirmado.auth.infrastructure.RefreshTokenRepository;
import br.com.culturatech.precoconfirmado.shared.config.JwtProperties;
import br.com.culturatech.precoconfirmado.shared.util.Hashing;
import br.com.culturatech.precoconfirmado.user.domain.UserEntity;
import br.com.culturatech.precoconfirmado.user.domain.UserRole;
import br.com.culturatech.precoconfirmado.user.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {
    @Test
    void rotatesRefreshTokenAndRevokesPreviousToken() {
        Instant now = Instant.parse("2026-06-05T12:00:00Z");
        Clock clock = Clock.fixed(now, ZoneOffset.UTC);
        UserRepository users = mock(UserRepository.class);
        RefreshTokenRepository tokens = mock(RefreshTokenRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        JwtTokenService jwt = mock(JwtTokenService.class);
        JwtProperties properties = new JwtProperties("a".repeat(32), Duration.ofMinutes(15), Duration.ofDays(7));
        AuthService service = new AuthService(users, tokens, passwordEncoder, jwt, properties, clock);

        UUID userId = UUID.randomUUID();
        UserEntity user = new UserEntity(userId, "User", "user@example.com", "hash", UserRole.USER, now);
        String opaque = "old-refresh-token";
        RefreshTokenEntity current = new RefreshTokenEntity(UUID.randomUUID(), userId, Hashing.sha256(opaque),
                now.plus(Duration.ofDays(1)), now.minusSeconds(10), null, null);
        when(tokens.findLockedByTokenHash(Hashing.sha256(opaque))).thenReturn(Optional.of(current));
        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(jwt.createAccessToken(user)).thenReturn("access");
        when(jwt.expiresInSeconds()).thenReturn(900L);

        var response = service.refresh(opaque, "agent", "127.0.0.1");

        assertThat(current.getRevokedAt()).isEqualTo(now);
        assertThat(response.refreshToken()).isNotEqualTo(opaque);
        verify(tokens).findLockedByTokenHash(Hashing.sha256(opaque));
        ArgumentCaptor<RefreshTokenEntity> captor = ArgumentCaptor.forClass(RefreshTokenEntity.class);
        verify(tokens).save(captor.capture());
        assertThat(captor.getValue().getTokenHash()).isEqualTo(Hashing.sha256(response.refreshToken()));
    }
}
