package br.com.culturatech.precoconfirmado.verification.domain;

import br.com.culturatech.precoconfirmado.monitoring.domain.PriceSnapshotEntity;
import br.com.culturatech.precoconfirmado.product.domain.TrackedProductEntity;
import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Component
public class ConfidenceScoreCalculator {
    private final VariantMatcher variantMatcher;

    public ConfidenceScoreCalculator(VariantMatcher variantMatcher) {
        this.variantMatcher = variantMatcher;
    }

    public ConfidenceScoreResult calculate(TrackedProductEntity product, PriceSnapshotEntity first,
                                           PriceSnapshotEntity second, Instant validUntil) {
        int score = 0;
        List<String> reasons = new ArrayList<>();

        boolean variant = variantMatcher.matches(product, first)
                && variantMatcher.matches(product, second)
                && variantMatcher.sameOffer(first, second);
        score += points(variant, 30, "product_and_variant_match", "product_or_variant_mismatch", reasons);

        boolean price = first.getPrice().compareTo(second.getPrice()) == 0;
        score += points(price, 25, "price_confirmed", "price_changed_between_checks", reasons);

        boolean stock = first.isInStock() && second.isInStock();
        score += points(stock, 15, "stock_confirmed", "out_of_stock", reasons);

        boolean seller = present(first.getSellerId()) && first.getSellerId().equals(second.getSellerId());
        score += points(seller, 10, "seller_consistent", "seller_missing_or_changed", reasons);

        boolean payment = first.getPaymentType() != PaymentType.UNKNOWN
                && first.getPaymentType() == second.getPaymentType();
        score += points(payment, 10, "payment_consistent", "payment_missing_or_changed", reasons);

        boolean coupon = first.isCouponRequired() == second.isCouponRequired()
                && Objects.equals(first.getCouponCode(), second.getCouponCode());
        score += points(coupon, 5, "coupon_consistent", "coupon_changed", reasons);

        boolean timely = !second.getObservedAt().isAfter(validUntil);
        score += points(timely, 5, "recheck_within_validity", "recheck_expired", reasons);

        return new ConfidenceScoreResult(score, confidence(score), List.copyOf(reasons));
    }

    public Confidence confidence(int score) {
        if (score >= 90) {
            return Confidence.HIGH;
        }
        if (score >= 70) {
            return Confidence.MEDIUM;
        }
        return Confidence.LOW;
    }

    private int points(boolean condition, int points, String success, String failure, List<String> reasons) {
        reasons.add(condition ? success : failure);
        return condition ? points : 0;
    }

    private boolean present(String value) {
        return value != null && !value.isBlank();
    }
}
