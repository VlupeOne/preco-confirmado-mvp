package br.com.culturatech.precoconfirmado.alert.api;

import br.com.culturatech.precoconfirmado.alert.domain.AlertEntity;
import br.com.culturatech.precoconfirmado.alert.domain.AlertStatus;
import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import br.com.culturatech.precoconfirmado.verification.domain.Confidence;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AlertResponse(
        UUID id, UUID userId, UUID trackedProductId, UUID verificationAttemptId,
        BigDecimal verifiedPrice, BigDecimal targetPrice, String currency, int confidenceScore,
        Confidence confidence, PaymentType paymentType, String sellerId, String sourceUrl,
        AlertStatus status, Instant createdAt, Instant readAt
) {
    public static AlertResponse from(AlertEntity value) {
        return new AlertResponse(value.getId(), value.getUserId(), value.getTrackedProductId(),
                value.getVerificationAttemptId(), value.getVerifiedPrice(), value.getTargetPrice(),
                value.getCurrency(), value.getConfidenceScore(), value.getConfidence(), value.getPaymentType(),
                value.getSellerId(), value.getSourceUrl(), value.getStatus(), value.getCreatedAt(), value.getReadAt());
    }
}
