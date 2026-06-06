package br.com.culturatech.precoconfirmado.monitoring.domain;

import br.com.culturatech.precoconfirmado.provider.domain.PriceQuote;
import br.com.culturatech.precoconfirmado.shared.util.Hashing;
import br.com.culturatech.precoconfirmado.shared.util.TextNormalizer;
import org.springframework.stereotype.Component;

@Component
public class OfferFingerprint {
    private final TextNormalizer normalizer;

    public OfferFingerprint(TextNormalizer normalizer) {
        this.normalizer = normalizer;
    }

    public String calculate(PriceQuote quote) {
        String canonical = String.join("|",
                value(quote.providerCode()), value(quote.externalId()), value(normalizer.normalize(quote.title())),
                value(quote.price()), value(quote.currency()), value(quote.paymentType()), value(quote.couponCode()),
                value(quote.sellerId()), value(quote.condition()), value(normalizer.normalize(quote.color())),
                value(normalizer.normalize(quote.storage())), Boolean.toString(quote.inStock()));
        return Hashing.sha256(canonical);
    }

    private String value(Object value) {
        return value == null ? "" : value.toString();
    }
}
