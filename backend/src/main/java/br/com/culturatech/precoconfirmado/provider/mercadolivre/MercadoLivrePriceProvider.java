package br.com.culturatech.precoconfirmado.provider.mercadolivre;

import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import br.com.culturatech.precoconfirmado.provider.domain.PriceProvider;
import br.com.culturatech.precoconfirmado.provider.domain.PriceQuote;
import br.com.culturatech.precoconfirmado.shared.config.MercadoLivreProperties;
import br.com.culturatech.precoconfirmado.shared.exception.ProviderException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import java.math.BigDecimal;
import java.net.http.HttpClient;
import java.time.Clock;
import java.util.Locale;

@Component
@ConditionalOnProperty(name = "app.mercado-livre.enabled", havingValue = "true")
public class MercadoLivrePriceProvider implements PriceProvider {
    private static final Logger log = LoggerFactory.getLogger(MercadoLivrePriceProvider.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final boolean salePriceEnabled;

    public MercadoLivrePriceProvider(MercadoLivreProperties properties, ObjectMapper objectMapper, Clock clock) {
        HttpClient httpClient = HttpClient.newBuilder().connectTimeout(properties.connectTimeout()).build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(properties.readTimeout());
        RestClient.Builder builder = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory);
        if (properties.accessToken() != null && !properties.accessToken().isBlank()) {
            builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.accessToken());
        }
        this.restClient = builder.build();
        this.objectMapper = objectMapper;
        this.clock = clock;
        this.salePriceEnabled = properties.accessToken() != null && !properties.accessToken().isBlank();
    }

    @Override
    public String providerCode() {
        return "MERCADO_LIVRE";
    }

    @Override
    public PriceQuote fetch(String externalId) {
        try {
            JsonNode item = restClient.get()
                    .uri("/items/{id}", externalId)
                    .retrieve()
                    .body(JsonNode.class);
            if (item == null || item.isMissingNode()) {
                throw new ProviderException("Mercado Livre returned an empty response");
            }
            JsonNode salePrice = salePriceEnabled ? fetchSalePrice(externalId) : null;
            BigDecimal price = salePrice == null ? decimal(item, "price") : decimal(salePrice, "amount");
            if (price == null || price.signum() <= 0) {
                throw new ProviderException("Mercado Livre did not return a valid price");
            }
            String color = attribute(item, "COLOR");
            String storage = firstPresent(attribute(item, "INTERNAL_MEMORY"), attribute(item, "STORAGE_CAPACITY"));
            Integer quantity = integer(item, "available_quantity");
            String condition = text(item, "condition");
            BigDecimal regularPrice = salePrice == null
                    ? decimal(item, "original_price")
                    : decimal(salePrice, "regular_amount");
            String currency = salePrice == null
                    ? textOr(item, "currency_id", "BRL")
                    : textOr(salePrice, "currency_id", textOr(item, "currency_id", "BRL"));
            ObjectNode raw = objectMapper.createObjectNode()
                    .set("item", item);
            if (salePrice != null) {
                raw.set("salePrice", salePrice);
            }
            return new PriceQuote(providerCode(), textOr(item, "id", externalId), textOr(item, "title", externalId),
                    price, regularPrice, currency,
                    PaymentType.UNKNOWN, null, null, false, null,
                    item.path("seller_id").isMissingNode() ? null : item.path("seller_id").asText(),
                    null, condition == null ? "UNKNOWN" : condition.toUpperCase(Locale.ROOT),
                    color, storage, quantity != null && quantity > 0, quantity,
                    textOr(item, "permalink", ""), clock.instant(), objectMapper.writeValueAsString(raw));
        } catch (RestClientResponseException exception) {
            int status = exception.getStatusCode().value();
            log.warn("Mercado Livre request failed for item {} with status {}", externalId, status);
            if (status == 429) {
                throw new ProviderException("Mercado Livre rate limit reached", true);
            }
            throw new ProviderException("Mercado Livre request failed with status " + status);
        } catch (ProviderException exception) {
            throw exception;
        } catch (Exception exception) {
            log.warn("Mercado Livre request failed for item {}: {}", externalId,
                    exception.getClass().getSimpleName());
            throw new ProviderException("Mercado Livre is unavailable");
        }
    }

    private JsonNode fetchSalePrice(String externalId) {
        try {
            return restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/items/{id}/sale_price")
                            .queryParam("context", "channel_marketplace")
                            .build(externalId))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException exception) {
            int status = exception.getStatusCode().value();
            if (status == 400 || status == 401 || status == 403 || status == 404) {
                log.info("Mercado Livre sale_price unavailable for item {} with status {}", externalId, status);
                return null;
            }
            if (status == 429) {
                throw new ProviderException("Mercado Livre rate limit reached", true);
            }
            throw new ProviderException("Mercado Livre sale_price failed with status " + status);
        }
    }

    private String attribute(JsonNode item, String id) {
        for (JsonNode attribute : item.path("attributes")) {
            if (id.equals(attribute.path("id").asText())) {
                return attribute.path("value_name").isNull() ? null : attribute.path("value_name").asText(null);
            }
        }
        return null;
    }

    private BigDecimal decimal(JsonNode node, String field) {
        return node.path(field).isNumber() ? node.path(field).decimalValue() : null;
    }

    private Integer integer(JsonNode node, String field) {
        return node.path(field).isNumber() ? node.path(field).intValue() : null;
    }

    private String text(JsonNode node, String field) {
        return node.path(field).isTextual() ? node.path(field).asText() : null;
    }

    private String textOr(JsonNode node, String field, String fallback) {
        String value = text(node, field);
        return value == null ? fallback : value;
    }

    private String firstPresent(String first, String second) {
        return first != null ? first : second;
    }
}
