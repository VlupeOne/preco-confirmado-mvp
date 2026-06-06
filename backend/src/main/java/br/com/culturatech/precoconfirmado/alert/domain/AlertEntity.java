package br.com.culturatech.precoconfirmado.alert.domain;

import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import br.com.culturatech.precoconfirmado.verification.domain.Confidence;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "alerts")
public class AlertEntity {
    @Id
    private UUID id;
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(name = "tracked_product_id", nullable = false)
    private UUID trackedProductId;
    @Column(name = "verification_attempt_id", nullable = false)
    private UUID verificationAttemptId;
    @Column(name = "verified_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal verifiedPrice;
    @Column(name = "target_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal targetPrice;
    @Column(nullable = false, length = 3)
    private String currency;
    @Column(name = "confidence_score", nullable = false)
    private int confidenceScore;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Confidence confidence;
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 30)
    private PaymentType paymentType;
    @Column(name = "seller_id", length = 120)
    private String sellerId;
    @Column(name = "source_url", nullable = false, length = 2048)
    private String sourceUrl;
    @Column(nullable = false, length = 64)
    private String fingerprint;
    @Column(name = "coupon_code", length = 120)
    private String couponCode;
    @Column(name = "idempotency_key", nullable = false, unique = true, length = 64)
    private String idempotencyKey;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AlertStatus status;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "read_at")
    private Instant readAt;

    protected AlertEntity() {
    }

    public AlertEntity(UUID id, UUID userId, UUID trackedProductId, UUID verificationAttemptId,
                       BigDecimal verifiedPrice, BigDecimal targetPrice, String currency,
                       int confidenceScore, Confidence confidence, PaymentType paymentType,
                       String sellerId, String sourceUrl, String fingerprint, String couponCode,
                       String idempotencyKey, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.trackedProductId = trackedProductId;
        this.verificationAttemptId = verificationAttemptId;
        this.verifiedPrice = verifiedPrice;
        this.targetPrice = targetPrice;
        this.currency = currency;
        this.confidenceScore = confidenceScore;
        this.confidence = confidence;
        this.paymentType = paymentType;
        this.sellerId = sellerId;
        this.sourceUrl = sourceUrl;
        this.fingerprint = fingerprint;
        this.couponCode = couponCode;
        this.idempotencyKey = idempotencyKey;
        this.status = AlertStatus.NOTIFICATION_PENDING;
        this.createdAt = createdAt;
    }

    public void markRead(Instant now) { this.readAt = now; }
    public void notified() { this.status = AlertStatus.NOTIFIED; }
    public void notificationFailed() { this.status = AlertStatus.NOTIFICATION_FAILED; }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getTrackedProductId() { return trackedProductId; }
    public UUID getVerificationAttemptId() { return verificationAttemptId; }
    public BigDecimal getVerifiedPrice() { return verifiedPrice; }
    public BigDecimal getTargetPrice() { return targetPrice; }
    public String getCurrency() { return currency; }
    public int getConfidenceScore() { return confidenceScore; }
    public Confidence getConfidence() { return confidence; }
    public PaymentType getPaymentType() { return paymentType; }
    public String getSellerId() { return sellerId; }
    public String getSourceUrl() { return sourceUrl; }
    public String getFingerprint() { return fingerprint; }
    public String getCouponCode() { return couponCode; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public AlertStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getReadAt() { return readAt; }
}
