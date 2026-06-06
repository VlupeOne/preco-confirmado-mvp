package br.com.culturatech.precoconfirmado.verification.application;

import br.com.culturatech.precoconfirmado.product.infrastructure.TrackedProductRepository;
import br.com.culturatech.precoconfirmado.provider.application.PriceProviderRegistry;
import br.com.culturatech.precoconfirmado.shared.config.MonitoringProperties;
import br.com.culturatech.precoconfirmado.shared.exception.ProviderException;
import br.com.culturatech.precoconfirmado.verification.domain.VerificationStatus;
import br.com.culturatech.precoconfirmado.verification.infrastructure.VerificationAttemptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Clock;

@Service
public class VerificationCoordinator {
    private static final Logger log = LoggerFactory.getLogger(VerificationCoordinator.class);
    private final VerificationAttemptRepository verificationRepository;
    private final TrackedProductRepository productRepository;
    private final PriceProviderRegistry providerRegistry;
    private final VerificationPersistenceService persistenceService;
    private final MonitoringProperties properties;
    private final Clock clock;

    public VerificationCoordinator(VerificationAttemptRepository verificationRepository,
                                   TrackedProductRepository productRepository,
                                   PriceProviderRegistry providerRegistry,
                                   VerificationPersistenceService persistenceService,
                                   MonitoringProperties properties, Clock clock) {
        this.verificationRepository = verificationRepository;
        this.productRepository = productRepository;
        this.providerRegistry = providerRegistry;
        this.persistenceService = persistenceService;
        this.properties = properties;
        this.clock = clock;
    }

    public int processPending() {
        var page = verificationRepository.findByStatusAndRecheckAfterLessThanEqual(
                VerificationStatus.PENDING_RECHECK, clock.instant(),
                PageRequest.of(0, properties.batchSize(), Sort.by("recheckAfter").ascending()));
        page.forEach(verification -> {
            var product = productRepository.findVisibleById(verification.getTrackedProductId()).orElse(null);
            if (product == null) {
                persistenceService.providerError(verification.getId(), "tracked_product_missing");
                return;
            }
            try {
                var quote = providerRegistry.require(product.getProviderCode()).fetch(product.getExternalId());
                persistenceService.complete(verification.getId(), quote);
            } catch (ProviderException exception) {
                persistenceService.providerError(verification.getId(), "provider_error");
                log.warn("Provider error during recheck verification={}: {}",
                        verification.getId(), exception.getMessage());
            } catch (Exception exception) {
                persistenceService.providerError(verification.getId(), "unexpected_error");
                log.error("Unexpected recheck error verification={}", verification.getId(), exception);
            }
        });
        return page.getNumberOfElements();
    }
}
