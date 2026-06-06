package br.com.culturatech.precoconfirmado.verification.api;

import br.com.culturatech.precoconfirmado.verification.domain.Confidence;
import br.com.culturatech.precoconfirmado.verification.domain.VerificationAttemptEntity;
import br.com.culturatech.precoconfirmado.verification.domain.VerificationStatus;

import java.time.Instant;
import java.util.UUID;

public record VerificationResponse(
        UUID id, UUID firstSnapshotId, UUID secondSnapshotId, VerificationStatus status,
        Integer score, Confidence confidence, String reasons, Instant startedAt,
        Instant recheckAfter, Instant completedAt, Instant createdAt
) {
    public static VerificationResponse from(VerificationAttemptEntity value) {
        return new VerificationResponse(value.getId(), value.getFirstSnapshotId(), value.getSecondSnapshotId(),
                value.getStatus(), value.getScore(), value.getConfidence(), value.getReasons(),
                value.getStartedAt(), value.getRecheckAfter(), value.getCompletedAt(), value.getCreatedAt());
    }
}
