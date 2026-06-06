package br.com.culturatech.precoconfirmado.verification.domain;

import br.com.culturatech.precoconfirmado.monitoring.domain.PriceSnapshotEntity;
import br.com.culturatech.precoconfirmado.product.domain.TrackedProductEntity;
import br.com.culturatech.precoconfirmado.shared.util.TextNormalizer;
import org.springframework.stereotype.Component;

@Component
public class VariantMatcher {
    private final TextNormalizer normalizer;

    public VariantMatcher(TextNormalizer normalizer) {
        this.normalizer = normalizer;
    }

    public boolean matches(TrackedProductEntity product, PriceSnapshotEntity snapshot) {
        if (!product.getExternalId().equals(snapshot.getExternalId())) {
            return false;
        }
        if (!product.getCondition().equalsIgnoreCase(snapshot.getCondition())) {
            return false;
        }
        if (!matchesOptional(product.getColor(), snapshot.getColor())) {
            return false;
        }
        if (!matchesOptional(product.getStorage(), snapshot.getStorage())) {
            return false;
        }
        if (product.getModel() != null
                && !snapshot.getNormalizedTitle().contains(normalizer.normalize(product.getModel()))) {
            return false;
        }
        return snapshot.getNormalizedTitle().equals(product.getNormalizedTitle())
                || snapshot.getNormalizedTitle().contains(product.getNormalizedTitle())
                || product.getNormalizedTitle().contains(snapshot.getNormalizedTitle());
    }

    public boolean sameOffer(PriceSnapshotEntity first, PriceSnapshotEntity second) {
        return first.getExternalId().equals(second.getExternalId())
                && first.getNormalizedTitle().equals(second.getNormalizedTitle())
                && first.getCondition().equalsIgnoreCase(second.getCondition())
                && matchesOptional(first.getColor(), second.getColor())
                && matchesOptional(first.getStorage(), second.getStorage());
    }

    private boolean matchesOptional(String expected, String actual) {
        if (expected == null || expected.isBlank()) {
            return true;
        }
        return actual != null && normalizer.normalize(expected).equals(normalizer.normalize(actual));
    }
}
