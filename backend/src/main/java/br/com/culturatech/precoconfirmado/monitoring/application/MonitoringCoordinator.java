package br.com.culturatech.precoconfirmado.monitoring.application;

import br.com.culturatech.precoconfirmado.product.application.TrackedProductService;
import br.com.culturatech.precoconfirmado.product.domain.ProductStatus;
import br.com.culturatech.precoconfirmado.product.domain.TrackedProductEntity;
import br.com.culturatech.precoconfirmado.product.infrastructure.TrackedProductRepository;
import br.com.culturatech.precoconfirmado.provider.application.PriceProviderRegistry;
import br.com.culturatech.precoconfirmado.shared.config.MonitoringProperties;
import br.com.culturatech.precoconfirmado.shared.exception.ProviderException;
import br.com.culturatech.precoconfirmado.shared.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.UUID;

@Service
public class MonitoringCoordinator {
    private static final Logger log = LoggerFactory.getLogger(MonitoringCoordinator.class);
    private final TrackedProductRepository productRepository;
    private final TrackedProductService productService;
    private final PriceProviderRegistry providerRegistry;
    private final MonitoringPersistenceService persistenceService;
    private final MonitoringProperties properties;
    private final Clock clock;

    public MonitoringCoordinator(TrackedProductRepository productRepository, TrackedProductService productService,
                                 PriceProviderRegistry providerRegistry, MonitoringPersistenceService persistenceService,
                                 MonitoringProperties properties, Clock clock) {
        this.productRepository = productRepository;
        this.productService = productService;
        this.providerRegistry = providerRegistry;
        this.persistenceService = persistenceService;
        this.properties = properties;
        this.clock = clock;
    }

    public void checkNow(AuthenticatedUser user, UUID productId) {
        productService.requireAccessible(user, productId);
        process(productId);
    }

    public int processDue() {
        var page = productRepository.findByStatusAndNextCheckAtLessThanEqual(
                ProductStatus.ACTIVE, clock.instant(),
                PageRequest.of(0, properties.batchSize(), Sort.by("nextCheckAt").ascending()));
        page.forEach(product -> process(product.getId()));
        return page.getNumberOfElements();
    }

    public void process(UUID productId) {
        TrackedProductEntity product = productRepository.findVisibleById(productId).orElse(null);
        if (product == null || product.getStatus() != ProductStatus.ACTIVE) {
            return;
        }
        log.info("Starting price check: product={} provider={}", productId, product.getProviderCode());
        try {
            var quote = providerRegistry.require(product.getProviderCode()).fetch(product.getExternalId());
            persistenceService.recordFirst(productId, quote);
            log.info("Finished price check: product={}", productId);
        } catch (ProviderException exception) {
            persistenceService.markProviderError(productId);
            log.warn("Provider error checking product={}: {}", productId, exception.getMessage());
        } catch (Exception exception) {
            persistenceService.markProviderError(productId);
            log.error("Unexpected monitoring error for product={}", productId, exception);
        }
    }
}
