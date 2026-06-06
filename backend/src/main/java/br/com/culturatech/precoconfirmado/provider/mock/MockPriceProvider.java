package br.com.culturatech.precoconfirmado.provider.mock;

import br.com.culturatech.precoconfirmado.provider.domain.PriceProvider;
import br.com.culturatech.precoconfirmado.provider.domain.PriceQuote;
import br.com.culturatech.precoconfirmado.shared.exception.ProviderException;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class MockPriceProvider implements PriceProvider {
    private final MockOfferRepository repository;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    public MockPriceProvider(MockOfferRepository repository, ObjectMapper objectMapper, Clock clock) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.clock = clock;
    }

    @Override
    public String providerCode() {
        return "MOCK";
    }

    @Override
    public PriceQuote fetch(String externalId) {
        MockOfferEntity offer = repository.findByExternalId(externalId)
                .orElseThrow(() -> new ProviderException("Mock offer not found: " + externalId));
        return new PriceQuote(providerCode(), offer.getExternalId(), offer.getTitle(), offer.getPrice(),
                offer.getRegularPrice(), offer.getCurrency(), offer.getPaymentType(), null, null,
                offer.isCouponRequired(), offer.getCouponCode(), offer.getSellerId(), offer.getSellerName(),
                offer.getCondition(), offer.getColor(), offer.getStorage(), offer.isInStock(),
                offer.getAvailableQuantity(), offer.getSourceUrl(), clock.instant(), serialize(offer));
    }

    private String serialize(MockOfferEntity offer) {
        try {
            return objectMapper.writeValueAsString(MockOfferResponse.from(offer));
        } catch (JacksonException exception) {
            throw new ProviderException("Unable to serialize mock offer");
        }
    }
}
