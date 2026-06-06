package br.com.culturatech.precoconfirmado.notification.application;

import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Component
public class NotificationFormatter {
    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter
            .ofPattern("dd/MM/yyyy HH:mm")
            .withLocale(PT_BR)
            .withZone(ZoneId.of("America/Sao_Paulo"));

    private final ObjectMapper objectMapper;

    public NotificationFormatter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String format(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            return """
                    Preço confirmado: %s no %s

                    Produto: %s%s
                    Vendedor: %s
                    Estoque: %s
                    Preço desejado: %s
                    Cupom: %s
                    Confiança: %s - %s/100
                    Verificado em: %s
                    Link: %s
                    """.formatted(
                    money(node, "verifiedPrice"),
                    text(node, "paymentType", "não informado"),
                    text(node, "title", "Produto"),
                    variant(node),
                    text(node, "seller", "não informado"),
                    node.path("inStock").asBoolean(false) ? "disponível" : "indisponível",
                    money(node, "targetPrice"),
                    text(node, "coupon", "não necessário"),
                    text(node, "confidence", "UNKNOWN"),
                    node.path("score").asInt(0),
                    formatInstant(node.path("verifiedAt").asText(null)),
                    text(node, "sourceUrl", "não informado"));
        } catch (Exception exception) {
            return payload;
        }
    }

    private String money(JsonNode node, String field) {
        BigDecimal value = node.path(field).decimalValue();
        String currency = text(node, "currency", "BRL");
        if ("BRL".equals(currency)) {
            return NumberFormat.getCurrencyInstance(PT_BR).format(value);
        }
        return currency + " " + value.toPlainString();
    }

    private String variant(JsonNode node) {
        String variant = node.path("variant").asText("").trim();
        return variant.isEmpty() ? "" : "\nVariante: " + variant;
    }

    private String formatInstant(String value) {
        return value == null ? "não informado" : DATE_FORMAT.format(Instant.parse(value));
    }

    private String text(JsonNode node, String field, String fallback) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() || value.asText().isBlank()
                ? fallback
                : value.asText();
    }
}
