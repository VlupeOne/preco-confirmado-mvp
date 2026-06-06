package br.com.culturatech.precoconfirmado.provider.domain;

import java.math.BigDecimal;
import java.time.Instant;

public record PriceQuote(
        String providerCode,
        String externalId,
        String title,
        BigDecimal price,
        BigDecimal regularPrice,
        String currency,
        PaymentType paymentType,
        Integer installmentCount,
        BigDecimal installmentAmount,
        boolean couponRequired,
        String couponCode,
        String sellerId,
        String sellerName,
        String condition,
        String color,
        String storage,
        boolean inStock,
        Integer availableQuantity,
        String sourceUrl,
        Instant observedAt,
        String rawPayload
) {
}
