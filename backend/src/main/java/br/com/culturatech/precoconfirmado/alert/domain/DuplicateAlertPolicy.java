package br.com.culturatech.precoconfirmado.alert.domain;

import br.com.culturatech.precoconfirmado.monitoring.domain.PriceSnapshotEntity;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public class DuplicateAlertPolicy {
    public boolean shouldSuppress(AlertEntity previous, PriceSnapshotEntity current,
                                  BigDecimal minimumDropPercent) {
        boolean sameTerms = Objects.equals(previous.getSellerId(), current.getSellerId())
                && previous.getPaymentType() == current.getPaymentType()
                && Objects.equals(previous.getCouponCode(), current.getCouponCode());
        return sameTerms && !additionalDropReached(
                previous.getVerifiedPrice(), current.getPrice(), minimumDropPercent);
    }

    public boolean additionalDropReached(BigDecimal previousPrice, BigDecimal currentPrice,
                                         BigDecimal minimumPercent) {
        if (previousPrice == null || previousPrice.signum() <= 0 || currentPrice == null) {
            return false;
        }
        BigDecimal drop = previousPrice.subtract(currentPrice)
                .multiply(BigDecimal.valueOf(100))
                .divide(previousPrice, 4, RoundingMode.HALF_UP);
        return drop.compareTo(minimumPercent) >= 0;
    }
}
