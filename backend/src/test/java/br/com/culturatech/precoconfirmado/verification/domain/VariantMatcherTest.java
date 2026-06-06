package br.com.culturatech.precoconfirmado.verification.domain;

import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import br.com.culturatech.precoconfirmado.shared.util.TextNormalizer;
import br.com.culturatech.precoconfirmado.support.TestData;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class VariantMatcherTest {
    private final VariantMatcher matcher = new VariantMatcher(new TextNormalizer());

    @Test
    void matchesExpectedVariant() {
        var product = TestData.product();
        var snapshot = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("3499"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW);
        assertThat(matcher.matches(product, snapshot)).isTrue();
    }

    @Test
    void rejectsDifferentExternalId() {
        var product = TestData.product();
        var snapshot = TestData.snapshot(product, "OTHER-ID", new BigDecimal("3499"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW);
        assertThat(matcher.matches(product, snapshot)).isFalse();
    }
}
