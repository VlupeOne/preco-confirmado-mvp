package br.com.culturatech.precoconfirmado.product.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record TrackedProductRequest(
        @NotBlank @Size(max = 50) String providerCode,
        @NotBlank @Size(max = 120) String externalId,
        @NotBlank @Size(max = 2048) @Pattern(regexp = "https?://.+", message = "must be a valid HTTP(S) URL")
        String sourceUrl,
        @NotBlank @Size(max = 500) String title,
        @Size(max = 120) String brand,
        @Size(max = 120) String model,
        @Size(max = 80) String color,
        @Size(max = 80) String storage,
        @NotBlank @Size(max = 30) String condition,
        @NotNull @DecimalMin(value = "0.01") BigDecimal targetPrice,
        @Pattern(regexp = "[A-Z]{3}") String currency,
        @Min(5) int checkIntervalMinutes
) {
}
