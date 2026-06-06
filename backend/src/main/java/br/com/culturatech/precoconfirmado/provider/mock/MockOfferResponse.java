package br.com.culturatech.precoconfirmado.provider.mock;

import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MockOfferResponse(
        UUID id, String externalId, String title, BigDecimal price, BigDecimal regularPrice,
        String currency, PaymentType paymentType, String sellerId, String sellerName,
        String condition, String color, String storage, boolean inStock, Integer availableQuantity,
        boolean couponRequired, String couponCode, String sourceUrl, Instant updatedAt
) {
    public static MockOfferResponse from(MockOfferEntity offer) {
        return new MockOfferResponse(offer.getId(), offer.getExternalId(), offer.getTitle(), offer.getPrice(),
                offer.getRegularPrice(), offer.getCurrency(), offer.getPaymentType(), offer.getSellerId(),
                offer.getSellerName(), offer.getCondition(), offer.getColor(), offer.getStorage(),
                offer.isInStock(), offer.getAvailableQuantity(), offer.isCouponRequired(), offer.getCouponCode(),
                offer.getSourceUrl(), offer.getUpdatedAt());
    }
}
