package br.com.culturatech.precoconfirmado.auth.application;

import br.com.culturatech.precoconfirmado.auth.api.AuthResponse;
import br.com.culturatech.precoconfirmado.auth.api.LoginRequest;
import br.com.culturatech.precoconfirmado.auth.api.RegisterRequest;
import br.com.culturatech.precoconfirmado.auth.domain.RefreshTokenEntity;
import br.com.culturatech.precoconfirmado.auth.infrastructure.RefreshTokenRepository;
import br.com.culturatech.precoconfirmado.shared.config.JwtProperties;
import br.com.culturatech.precoconfirmado.shared.exception.ConflictException;
import br.com.culturatech.precoconfirmado.shared.exception.NotFoundException;
import br.com.culturatech.precoconfirmado.shared.util.Hashing;
import br.com.culturatech.precoconfirmado.user.domain.UserEntity;
import br.com.culturatech.precoconfirmado.user.domain.UserRole;
import br.com.culturatech.precoconfirmado.user.infrastructure.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final JwtProperties jwtProperties;
    private final Clock clock;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder, JwtTokenService jwtTokenService,
                       JwtProperties jwtProperties, Clock clock) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.jwtProperties = jwtProperties;
        this.clock = clock;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, String userAgent, String ipAddress) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("E-mail já cadastrado.");
        }
        Instant now = clock.instant();
        UserEntity user = userRepository.save(new UserEntity(
                UUID.randomUUID(), request.name().trim(), email,
                passwordEncoder.encode(request.password()), UserRole.USER, now));
        return issueTokens(user, userAgent, ipAddress);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String userAgent, String ipAddress) {
        UserEntity user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!user.isActive() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        return issueTokens(user, userAgent, ipAddress);
    }

    @Transactional
    public AuthResponse refresh(String opaqueToken, String userAgent, String ipAddress) {
        Instant now = clock.instant();
        RefreshTokenEntity current = refreshTokenRepository.findLockedByTokenHash(Hashing.sha256(opaqueToken))
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));
        if (!current.isUsableAt(now)) {
            throw new BadCredentialsException("Expired or revoked refresh token");
        }
        UserEntity user = userRepository.findById(current.getUserId())
                .filter(UserEntity::isActive)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));
        current.revoke(now);
        return issueTokens(user, userAgent, ipAddress);
    }

    @Transactional
    public void logout(String opaqueToken, UUID authenticatedUserId) {
        RefreshTokenEntity token = refreshTokenRepository.findByTokenHash(Hashing.sha256(opaqueToken))
                .filter(value -> value.getUserId().equals(authenticatedUserId))
                .orElseThrow(() -> new NotFoundException("Refresh token não encontrado."));
        if (token.getRevokedAt() == null) {
            token.revoke(clock.instant());
        }
    }

    private AuthResponse issueTokens(UserEntity user, String userAgent, String ipAddress) {
        Instant now = clock.instant();
        String opaqueToken = newOpaqueToken();
        refreshTokenRepository.save(new RefreshTokenEntity(
                UUID.randomUUID(), user.getId(), Hashing.sha256(opaqueToken),
                now.plus(jwtProperties.refreshExpiration()), now, truncate(userAgent, 500), truncate(ipAddress, 64)));
        return new AuthResponse(jwtTokenService.createAccessToken(user), opaqueToken,
                jwtTokenService.expiresInSeconds(), "Bearer");
    }

    private String newOpaqueToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
