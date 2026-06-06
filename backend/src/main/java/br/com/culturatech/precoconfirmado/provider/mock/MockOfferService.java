package br.com.culturatech.precoconfirmado.provider.mock;

import br.com.culturatech.precoconfirmado.shared.exception.ConflictException;
import br.com.culturatech.precoconfirmado.shared.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
public class MockOfferService {
    private final MockOfferRepository repository;
    private final Clock clock;

    public MockOfferService(MockOfferRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional
    public MockOfferResponse create(MockOfferRequest request) {
        if (repository.existsByExternalId(request.externalId())) {
            throw new ConflictException("Mock offer already exists.");
        }
        MockOfferEntity offer = new MockOfferEntity(
                UUID.randomUUID(), request.externalId(), request.title(), request.price(), request.regularPrice(),
                currency(request.currency()), request.paymentType(), request.sellerId(), request.sellerName(),
                request.condition(), request.color(), request.storage(), request.inStock(),
                request.availableQuantity(), request.couponRequired(), request.couponCode(),
                request.sourceUrl(), clock.instant());
        return MockOfferResponse.from(repository.save(offer));
    }

    @Transactional
    public MockOfferResponse update(String externalId, MockOfferRequest request) {
        MockOfferEntity offer = require(externalId);
        offer.update(request.title(), request.price(), request.regularPrice(), currency(request.currency()),
                request.paymentType(), request.sellerId(), request.sellerName(), request.condition(),
                request.color(), request.storage(), request.inStock(), request.availableQuantity(),
                request.couponRequired(), request.couponCode(), request.sourceUrl(), clock.instant());
        return MockOfferResponse.from(offer);
    }

    @Transactional(readOnly = true)
    public List<MockOfferResponse> list() {
        return repository.findAll().stream().map(MockOfferResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public MockOfferResponse get(String externalId) {
        return MockOfferResponse.from(require(externalId));
    }

    @Transactional
    public void delete(String externalId) {
        repository.delete(require(externalId));
    }

    private MockOfferEntity require(String externalId) {
        return repository.findByExternalId(externalId)
                .orElseThrow(() -> new NotFoundException("Mock offer not found."));
    }

    private String currency(String currency) {
        return currency == null ? "BRL" : currency;
    }
}
