package br.com.culturatech.precoconfirmado.monitoring.application;

import br.com.culturatech.precoconfirmado.monitoring.domain.OfferFingerprint;
import br.com.culturatech.precoconfirmado.monitoring.domain.PriceSnapshotEntity;
import br.com.culturatech.precoconfirmado.provider.domain.PriceQuote;
import br.com.culturatech.precoconfirmado.shared.util.TextNormalizer;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SnapshotFactory {
    private final TextNormalizer normalizer;
    private final OfferFingerprint fingerprint;

    public SnapshotFactory(TextNormalizer normalizer, OfferFingerprint fingerprint) {
        this.normalizer = normalizer;
        this.fingerprint = fingerprint;
    }

    public PriceSnapshotEntity create(UUID productId, PriceQuote quote) {
        return new PriceSnapshotEntity(UUID.randomUUID(), productId, quote.providerCode(), quote.externalId(),
                quote.title(), normalizer.normalize(quote.title()), quote.price(), quote.regularPrice(),
                quote.currency(), quote.paymentType(), quote.installmentCount(), quote.installmentAmount(),
                quote.couponRequired(), quote.couponCode(), quote.sellerId(), quote.sellerName(),
                quote.condition(), quote.color(), quote.storage(), quote.inStock(), quote.availableQuantity(),
                quote.sourceUrl(), quote.observedAt(), fingerprint.calculate(quote), quote.rawPayload());
    }
}
