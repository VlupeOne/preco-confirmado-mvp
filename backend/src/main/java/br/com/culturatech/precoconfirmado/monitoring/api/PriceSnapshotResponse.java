package br.com.culturatech.precoconfirmado.monitoring.api;

import br.com.culturatech.precoconfirmado.monitoring.domain.PriceSnapshotEntity;
import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PriceSnapshotResponse(
        UUID id, String providerCode, String externalId, String title, BigDecimal price,
        BigDecimal regularPrice, String currency, PaymentType paymentType, Integer installmentCount,
        BigDecimal installmentAmount, boolean couponRequired, String couponCode, String sellerId,
        String sellerName, String condition, String color, String storage, boolean inStock,
        Integer availableQuantity, String sourceUrl, Instant observedAt, String fingerprint
) {
    public static PriceSnapshotResponse from(PriceSnapshotEntity value) {
        return new PriceSnapshotResponse(value.getId(), value.getProviderCode(), value.getExternalId(),
                value.getTitle(), value.getPrice(), value.getRegularPrice(), value.getCurrency(),
                value.getPaymentType(), value.getInstallmentCount(), value.getInstallmentAmount(),
                value.isCouponRequired(), value.getCouponCode(), value.getSellerId(), value.getSellerName(),
                value.getCondition(), value.getColor(), value.getStorage(), value.isInStock(),
                value.getAvailableQuantity(), value.getSourceUrl(), value.getObservedAt(), value.getFingerprint());
    }
}
