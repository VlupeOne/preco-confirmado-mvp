package br.com.culturatech.precoconfirmado.verification.domain;

import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import br.com.culturatech.precoconfirmado.shared.util.TextNormalizer;
import br.com.culturatech.precoconfirmado.support.TestData;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ConfidenceScoreCalculatorTest {
    private final ConfidenceScoreCalculator calculator =
            new ConfidenceScoreCalculator(new VariantMatcher(new TextNormalizer()));

    @Test
    void approvesFullyConfirmedOffer() {
        var product = TestData.product();
        var first = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("3499"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW);
        var second = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("3499.00"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW.plusSeconds(120));

        var result = calculator.calculate(product, first, second, TestData.NOW.plusSeconds(180));

        assertThat(result.score()).isEqualTo(100);
        assertThat(result.confidence()).isEqualTo(Confidence.HIGH);
        assertThat(result.approved()).isTrue();
    }

    @Test
    void scoreNinetyIsHighAndApproved() {
        var product = TestData.product();
        var first = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("3499"), true,
                null, PaymentType.PIX, TestData.NOW);
        var second = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("3499"), true,
                null, PaymentType.PIX, TestData.NOW.plusSeconds(30));

        var result = calculator.calculate(product, first, second, TestData.NOW.plusSeconds(60));

        assertThat(result.score()).isEqualTo(90);
        assertThat(result.approved()).isTrue();
    }

    @Test
    void rejectsPriceChangeBelowNinety() {
        var product = TestData.product();
        var first = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("3499"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW);
        var second = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("3400"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW.plusSeconds(30));

        var result = calculator.calculate(product, first, second, TestData.NOW.plusSeconds(60));

        assertThat(result.score()).isEqualTo(75);
        assertThat(result.confidence()).isEqualTo(Confidence.MEDIUM);
        assertThat(result.approved()).isFalse();
    }

    @Test
    void rejectsMissingStock() {
        var product = TestData.product();
        var first = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("3499"), true,
                "SELLER-1", PaymentType.PIX, TestData.NOW);
        var second = TestData.snapshot(product, "NOTEBOOK-001", new BigDecimal("3499"), false,
                "SELLER-1", PaymentType.PIX, TestData.NOW.plusSeconds(30));

        var result = calculator.calculate(product, first, second, TestData.NOW.plusSeconds(60));

        assertThat(result.score()).isEqualTo(85);
        assertThat(result.approved()).isFalse();
    }

    @Test
    void classifiesBoundaries() {
        assertThat(calculator.confidence(90)).isEqualTo(Confidence.HIGH);
        assertThat(calculator.confidence(70)).isEqualTo(Confidence.MEDIUM);
        assertThat(calculator.confidence(69)).isEqualTo(Confidence.LOW);
    }
}
