package br.com.culturatech.precoconfirmado.shared.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TextNormalizerTest {
    private final TextNormalizer normalizer = new TextNormalizer();

    @Test
    void normalizesAccentsSpacingUnitsAndPunctuation() {
        assertThat(normalizer.normalize("  Notebook Ágil, 16 GB / 1 TB! "))
                .isEqualTo("notebook agil 16gb 1tb");
    }
}
