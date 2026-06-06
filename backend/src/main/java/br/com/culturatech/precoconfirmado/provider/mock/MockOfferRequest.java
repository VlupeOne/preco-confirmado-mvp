package br.com.culturatech.precoconfirmado.provider.mock;

import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record MockOfferRequest(
        @NotBlank @Size(max = 120) String externalId,
        @NotBlank @Size(max = 500) String title,
        @NotNull @DecimalMin("0.01") BigDecimal price,
        @DecimalMin("0.01") BigDecimal regularPrice,
        @Pattern(regexp = "[A-Z]{3}") String currency,
        @NotNull PaymentType paymentType,
        @Size(max = 120) String sellerId,
        @Size(max = 255) String sellerName,
        @NotBlank @Size(max = 30) String condition,
        @Size(max = 80) String color,
        @Size(max = 80) String storage,
        boolean inStock,
        @PositiveOrZero Integer availableQuantity,
        boolean couponRequired,
        @Size(max = 120) String couponCode,
        @NotBlank @Pattern(regexp = "https?://.+") @Size(max = 2048) String sourceUrl
) {
}
