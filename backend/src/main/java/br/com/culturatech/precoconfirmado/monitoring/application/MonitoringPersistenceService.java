package br.com.culturatech.precoconfirmado.monitoring.application;

import br.com.culturatech.precoconfirmado.monitoring.domain.PriceSnapshotEntity;
import br.com.culturatech.precoconfirmado.monitoring.infrastructure.PriceSnapshotRepository;
import br.com.culturatech.precoconfirmado.product.domain.ProductStatus;
import br.com.culturatech.precoconfirmado.product.domain.TrackedProductEntity;
import br.com.culturatech.precoconfirmado.product.infrastructure.TrackedProductRepository;
import br.com.culturatech.precoconfirmado.provider.domain.PriceQuote;
import br.com.culturatech.precoconfirmado.shared.config.MonitoringProperties;
import br.com.culturatech.precoconfirmado.shared.exception.NotFoundException;
import br.com.culturatech.precoconfirmado.verification.domain.VerificationAttemptEntity;
import br.com.culturatech.precoconfirmado.verification.domain.VerificationStatus;
import br.com.culturatech.precoconfirmado.verification.infrastructure.VerificationAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
public class MonitoringPersistenceService {
    private final TrackedProductRepository productRepository;
    private final PriceSnapshotRepository snapshotRepository;
    private final VerificationAttemptRepository verificationRepository;
    private final SnapshotFactory snapshotFactory;
    private final MonitoringProperties properties;
    private final Clock clock;

    public MonitoringPersistenceService(TrackedProductRepository productRepository,
                                        PriceSnapshotRepository snapshotRepository,
                                        VerificationAttemptRepository verificationRepository,
                                        SnapshotFactory snapshotFactory, MonitoringProperties properties, Clock clock) {
        this.productRepository = productRepository;
        this.snapshotRepository = snapshotRepository;
        this.verificationRepository = verificationRepository;
        this.snapshotFactory = snapshotFactory;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public UUID recordFirst(UUID productId, PriceQuote quote) {
        TrackedProductEntity product = productRepository.findLockedVisibleById(productId)
                .orElseThrow(() -> new NotFoundException("Produto monitorado não encontrado."));
        if (product.getStatus() != ProductStatus.ACTIVE) {
            return null;
        }
        PriceSnapshotEntity snapshot = snapshotRepository.save(snapshotFactory.create(productId, quote));
        Instant now = clock.instant();
        product.checked(now);
        boolean targetReached = quote.price().compareTo(product.getTargetPrice()) <= 0
                && product.getCurrency().equalsIgnoreCase(quote.currency());
        if (!targetReached || verificationRepository.existsByTrackedProductIdAndStatus(
                productId, VerificationStatus.PENDING_RECHECK)) {
            return null;
        }
        VerificationAttemptEntity verification = new VerificationAttemptEntity(
                UUID.randomUUID(), productId, snapshot.getId(), now,
                now.plus(properties.verificationRecheckDelay()));
        return verificationRepository.save(verification).getId();
    }

    @Transactional
    public void markProviderError(UUID productId) {
        productRepository.findLockedVisibleById(productId)
                .ifPresent(product -> product.providerError(clock.instant()));
    }
}
