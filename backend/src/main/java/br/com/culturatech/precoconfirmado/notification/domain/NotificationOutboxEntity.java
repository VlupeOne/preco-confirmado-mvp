package br.com.culturatech.precoconfirmado.notification.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notification_outbox")
public class NotificationOutboxEntity {
    @Id
    private UUID id;
    @Column(name = "alert_id", nullable = false)
    private UUID alertId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationChannel channel;
    @Column(nullable = false, length = 255)
    private String recipient;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private String payload;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OutboxStatus status;
    @Column(nullable = false)
    private int attempts;
    @Column(name = "next_attempt_at", nullable = false)
    private Instant nextAttemptAt;
    @Column(name = "last_error", length = 1000)
    private String lastError;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "sent_at")
    private Instant sentAt;
    @Column(name = "idempotency_key", nullable = false, unique = true, length = 64)
    private String idempotencyKey;

    protected NotificationOutboxEntity() {
    }

    public NotificationOutboxEntity(UUID id, UUID alertId, NotificationChannel channel, String recipient,
                                    String payload, Instant now, String idempotencyKey) {
        this.id = id;
        this.alertId = alertId;
        this.channel = channel;
        this.recipient = recipient;
        this.payload = payload;
        this.status = OutboxStatus.PENDING;
        this.nextAttemptAt = now;
        this.createdAt = now;
        this.idempotencyKey = idempotencyKey;
    }

    public void processing(Instant leaseUntil) {
        status = OutboxStatus.PROCESSING;
        attempts++;
        nextAttemptAt = leaseUntil;
    }
    public void sent(Instant now) { status = OutboxStatus.SENT; sentAt = now; lastError = null; }
    public void retry(Instant next, String error) { status = OutboxStatus.FAILED; nextAttemptAt = next; lastError = error; }
    public void dead(String error) { status = OutboxStatus.DEAD; lastError = error; }

    public UUID getId() { return id; }
    public UUID getAlertId() { return alertId; }
    public NotificationChannel getChannel() { return channel; }
    public String getRecipient() { return recipient; }
    public String getPayload() { return payload; }
    public OutboxStatus getStatus() { return status; }
    public int getAttempts() { return attempts; }
    public Instant getNextAttemptAt() { return nextAttemptAt; }
    public String getLastError() { return lastError; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getSentAt() { return sentAt; }
    public String getIdempotencyKey() { return idempotencyKey; }
}
