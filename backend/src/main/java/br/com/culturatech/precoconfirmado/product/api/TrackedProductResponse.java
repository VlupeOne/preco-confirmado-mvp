package br.com.culturatech.precoconfirmado.product.api;

import br.com.culturatech.precoconfirmado.product.domain.ProductStatus;
import br.com.culturatech.precoconfirmado.product.domain.TrackedProductEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TrackedProductResponse(
        UUID id, UUID userId, String providerCode, String externalId, String sourceUrl,
        String title, String brand, String model, String color, String storage, String condition,
        BigDecimal targetPrice, String currency, ProductStatus status, int checkIntervalMinutes,
        Instant lastCheckedAt, Instant nextCheckAt, Instant createdAt, Instant updatedAt, long version
) {
    public static TrackedProductResponse from(TrackedProductEntity product) {
        return new TrackedProductResponse(product.getId(), product.getUserId(), product.getProviderCode(),
                product.getExternalId(), product.getSourceUrl(), product.getTitle(), product.getBrand(),
                product.getModel(), product.getColor(), product.getStorage(), product.getCondition(),
                product.getTargetPrice(), product.getCurrency(), product.getStatus(),
                product.getCheckIntervalMinutes(), product.getLastCheckedAt(), product.getNextCheckAt(),
                product.getCreatedAt(), product.getUpdatedAt(), product.getVersion());
    }
}
