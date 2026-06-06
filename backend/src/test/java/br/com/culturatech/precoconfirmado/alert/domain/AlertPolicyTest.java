package br.com.culturatech.precoconfirmado.alert.domain;

import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import br.com.culturatech.precoconfirmado.support.TestData;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class AlertPolicyTest {
    private final DuplicateAlertPolicy policy = new DuplicateAlertPolicy();

    @Test
    void requiresConfiguredAdditionalDropDuringCooldown() {
        assertThat(policy.additionalDropReached(
                new BigDecimal("100.00"), new BigDecimal("95.00"), new BigDecimal("5"))).isTrue();
        assertThat(policy.additionalDropReached(
                new BigDecimal("100.00"), new BigDecimal("95.01"), new BigDecimal("5"))).isFalse();
    }

    @Test
    void idempotencyKeyIsDeterministicAndSensitiveToOffer() {
        var product = TestData.product();
        var snapshot = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("3499"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW);

        Duration cooldown = Duration.ofHours(24);
        String first = AlertIdempotency.key(
                product.getUserId(), product.getId(), snapshot, TestData.NOW, cooldown);
        String second = AlertIdempotency.key(
                product.getUserId(), product.getId(), snapshot, TestData.NOW, cooldown);

        assertThat(first).isEqualTo(second).hasSize(64);
    }

    @Test
    void idempotencyKeyChangesAfterCooldownWindow() {
        var product = TestData.product();
        var snapshot = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("3499"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW);
        Duration cooldown = Duration.ofHours(24);

        String current = AlertIdempotency.key(
                product.getUserId(), product.getId(), snapshot, TestData.NOW, cooldown);
        String later = AlertIdempotency.key(
                product.getUserId(), product.getId(), snapshot, TestData.NOW.plus(cooldown), cooldown);

        assertThat(later).isNotEqualTo(current);
    }

    @Test
    void suppressesSameTermsUnlessPriceDropsEnough() {
        var product = TestData.product();
        var previousSnapshot = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("100.00"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW);
        var previous = new AlertEntity(UUID.randomUUID(), product.getUserId(), product.getId(),
                UUID.randomUUID(), previousSnapshot.getPrice(), product.getTargetPrice(), "BRL",
                100, br.com.culturatech.precoconfirmado.verification.domain.Confidence.HIGH,
                PaymentType.PIX, "SELLER-1", previousSnapshot.getSourceUrl(),
                previousSnapshot.getFingerprint(), null, "a".repeat(64), TestData.NOW);
        var smallDrop = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("96.00"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW.plusSeconds(60));
        var enoughDrop = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("95.00"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW.plusSeconds(60));
        var newSeller = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("100.00"), true,
                "SELLER-2", PaymentType.PIX, TestData.NOW.plusSeconds(60));

        assertThat(policy.shouldSuppress(previous, smallDrop, new BigDecimal("5"))).isTrue();
        assertThat(policy.shouldSuppress(previous, enoughDrop, new BigDecimal("5"))).isFalse();
        assertThat(policy.shouldSuppress(previous, newSeller, new BigDecimal("5"))).isFalse();
    }
}
