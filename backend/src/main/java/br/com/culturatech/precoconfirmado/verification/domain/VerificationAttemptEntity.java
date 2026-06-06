package br.com.culturatech.precoconfirmado.verification.domain;

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
@Table(name = "verification_attempts")
public class VerificationAttemptEntity {
    @Id
    private UUID id;
    @Column(name = "tracked_product_id", nullable = false)
    private UUID trackedProductId;
    @Column(name = "first_snapshot_id", nullable = false)
    private UUID firstSnapshotId;
    @Column(name = "second_snapshot_id")
    private UUID secondSnapshotId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VerificationStatus status;
    private Integer score;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Confidence confidence;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private String reasons;
    @Column(name = "started_at", nullable = false)
    private Instant startedAt;
    @Column(name = "recheck_after", nullable = false)
    private Instant recheckAfter;
    @Column(name = "completed_at")
    private Instant completedAt;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected VerificationAttemptEntity() {
    }

    public VerificationAttemptEntity(UUID id, UUID trackedProductId, UUID firstSnapshotId,
                                     Instant startedAt, Instant recheckAfter) {
        this.id = id;
        this.trackedProductId = trackedProductId;
        this.firstSnapshotId = firstSnapshotId;
        this.status = VerificationStatus.PENDING_RECHECK;
        this.reasons = "[]";
        this.startedAt = startedAt;
        this.recheckAfter = recheckAfter;
        this.createdAt = startedAt;
    }

    public void complete(UUID secondSnapshotId, VerificationStatus status, int score,
                         Confidence confidence, String reasons, Instant completedAt) {
        this.secondSnapshotId = secondSnapshotId;
        this.status = status;
        this.score = score;
        this.confidence = confidence;
        this.reasons = reasons;
        this.completedAt = completedAt;
    }

    public void providerError(String reasons, Instant completedAt) {
        this.status = VerificationStatus.PROVIDER_ERROR;
        this.reasons = reasons;
        this.completedAt = completedAt;
    }

    public UUID getId() { return id; }
    public UUID getTrackedProductId() { return trackedProductId; }
    public UUID getFirstSnapshotId() { return firstSnapshotId; }
    public UUID getSecondSnapshotId() { return secondSnapshotId; }
    public VerificationStatus getStatus() { return status; }
    public Integer getScore() { return score; }
    public Confidence getConfidence() { return confidence; }
    public String getReasons() { return reasons; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getRecheckAfter() { return recheckAfter; }
    public Instant getCompletedAt() { return completedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
