package br.com.culturatech.precoconfirmado.notification.application;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationFormatterTest {
    private final NotificationFormatter formatter = new NotificationFormatter(
            JsonMapper.builder().build());

    @Test
    void formatsOutboxPayloadForHumans() {
        String payload = """
                {
                  "title": "Notebook Modelo X",
                  "variant": "Preto 512GB",
                  "verifiedPrice": 3499.00,
                  "targetPrice": 3500.00,
                  "currency": "BRL",
                  "paymentType": "PIX",
                  "coupon": null,
                  "seller": "Loja Exemplo",
                  "inStock": true,
                  "sourceUrl": "https://example.test/notebook",
                  "verifiedAt": "2026-06-05T17:32:00Z",
                  "confidence": "HIGH",
                  "score": 100
                }
                """;

        String message = formatter.format(payload);

        assertThat(message)
                .contains("Preço confirmado:")
                .contains("3.499,00 no PIX")
                .contains("Produto: Notebook Modelo X")
                .contains("Variante: Preto 512GB")
                .contains("Vendedor: Loja Exemplo")
                .contains("Confiança: HIGH - 100/100")
                .contains("Verificado em: 05/06/2026 14:32");
    }
}
