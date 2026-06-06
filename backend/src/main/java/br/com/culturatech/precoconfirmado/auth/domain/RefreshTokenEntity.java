package br.com.culturatech.precoconfirmado.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
public class RefreshTokenEntity {
    @Id
    private UUID id;
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
    @Column(name = "revoked_at")
    private Instant revokedAt;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    protected RefreshTokenEntity() {
    }

    public RefreshTokenEntity(UUID id, UUID userId, String tokenHash, Instant expiresAt,
                              Instant createdAt, String userAgent, String ipAddress) {
        this.id = id;
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.userAgent = userAgent;
        this.ipAddress = ipAddress;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getTokenHash() { return tokenHash; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getRevokedAt() { return revokedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public String getUserAgent() { return userAgent; }
    public String getIpAddress() { return ipAddress; }
    public boolean isUsableAt(Instant now) { return revokedAt == null && expiresAt.isAfter(now); }
    public void revoke(Instant now) { this.revokedAt = now; }
}
