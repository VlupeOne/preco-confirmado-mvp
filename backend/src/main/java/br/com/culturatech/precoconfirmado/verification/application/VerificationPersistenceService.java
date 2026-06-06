package br.com.culturatech.precoconfirmado.verification.application;

import br.com.culturatech.precoconfirmado.alert.application.AlertCreationService;
import br.com.culturatech.precoconfirmado.monitoring.application.SnapshotFactory;
import br.com.culturatech.precoconfirmado.monitoring.domain.PriceSnapshotEntity;
import br.com.culturatech.precoconfirmado.monitoring.infrastructure.PriceSnapshotRepository;
import br.com.culturatech.precoconfirmado.product.domain.ProductStatus;
import br.com.culturatech.precoconfirmado.product.domain.TrackedProductEntity;
import br.com.culturatech.precoconfirmado.product.infrastructure.TrackedProductRepository;
import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import br.com.culturatech.precoconfirmado.provider.domain.PriceQuote;
import br.com.culturatech.precoconfirmado.shared.config.MonitoringProperties;
import br.com.culturatech.precoconfirmado.shared.exception.NotFoundException;
import br.com.culturatech.precoconfirmado.verification.domain.ConfidenceScoreCalculator;
import br.com.culturatech.precoconfirmado.verification.domain.ConfidenceScoreResult;
import br.com.culturatech.precoconfirmado.verification.domain.VerificationAttemptEntity;
import br.com.culturatech.precoconfirmado.verification.domain.VerificationStatus;
import br.com.culturatech.precoconfirmado.verification.domain.VariantMatcher;
import br.com.culturatech.precoconfirmado.verification.infrastructure.VerificationAttemptRepository;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Objects;
import java.util.UUID;

@Service
public class VerificationPersistenceService {
    private static final Logger log = LoggerFactory.getLogger(VerificationPersistenceService.class);
    private final VerificationAttemptRepository verificationRepository;
    private final TrackedProductRepository productRepository;
    private final PriceSnapshotRepository snapshotRepository;
    private final SnapshotFactory snapshotFactory;
    private final ConfidenceScoreCalculator scoreCalculator;
    private final VariantMatcher variantMatcher;
    private final AlertCreationService alertCreationService;
    private final MonitoringProperties properties;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    public VerificationPersistenceService(VerificationAttemptRepository verificationRepository,
                                          TrackedProductRepository productRepository,
                                          PriceSnapshotRepository snapshotRepository, SnapshotFactory snapshotFactory,
                                          ConfidenceScoreCalculator scoreCalculator, VariantMatcher variantMatcher,
                                          AlertCreationService alertCreationService, MonitoringProperties properties,
                                          ObjectMapper objectMapper, Clock clock) {
        this.verificationRepository = verificationRepository;
        this.productRepository = productRepository;
        this.snapshotRepository = snapshotRepository;
        this.snapshotFactory = snapshotFactory;
        this.scoreCalculator = scoreCalculator;
        this.variantMatcher = variantMatcher;
        this.alertCreationService = alertCreationService;
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.clock = clock;
    }

    @Transactional
    public void complete(UUID verificationId, PriceQuote quote) {
        VerificationAttemptEntity verification = verificationRepository.findLockedById(verificationId)
                .orElseThrow(() -> new NotFoundException("Verificação não encontrada."));
        if (verification.getStatus() != VerificationStatus.PENDING_RECHECK) {
            return;
        }
        TrackedProductEntity product = productRepository.findVisibleById(verification.getTrackedProductId())
                .orElseThrow(() -> new NotFoundException("Produto monitorado não encontrado."));
        PriceSnapshotEntity first = snapshotRepository.findById(verification.getFirstSnapshotId())
                .orElseThrow(() -> new NotFoundException("Snapshot inicial não encontrado."));
        PriceSnapshotEntity second = snapshotRepository.save(snapshotFactory.create(product.getId(), quote));
        Instant now = clock.instant();
        Instant validUntil = verification.getRecheckAfter()
                .plus(properties.verificationRecheckDelay())
                .plus(properties.schedulerDelay());
        ConfidenceScoreResult score = scoreCalculator.calculate(product, first, second, validUntil);
        var reasons = new ArrayList<>(score.reasons());
        boolean eligible = product.getStatus() == ProductStatus.ACTIVE
                && second.getPrice().compareTo(product.getTargetPrice()) <= 0
                && first.getExternalId().equals(second.getExternalId())
                && variantMatcher.sameOffer(first, second)
                && first.isInStock() && second.isInStock()
                && product.getCurrency().equalsIgnoreCase(second.getCurrency())
                && first.getSellerId() != null && first.getSellerId().equals(second.getSellerId())
                && first.getPaymentType() != PaymentType.UNKNOWN
                && first.getPaymentType() == second.getPaymentType()
                && first.isCouponRequired() == second.isCouponRequired()
                && Objects.equals(first.getCouponCode(), second.getCouponCode())
                && !second.getObservedAt().isAfter(validUntil)
                && score.approved();
        if (!eligible) {
            reasons.add("alert_eligibility_failed");
        }
        VerificationStatus status = eligible ? VerificationStatus.APPROVED : VerificationStatus.REJECTED;
        verification.complete(second.getId(), status, score.score(), score.confidence(), json(reasons), now);
        if (eligible) {
            var alert = alertCreationService.createIfAllowed(product, verification, second, score);
            log.info(alert == null ? "Approved verification suppressed by duplicate policy: {}"
                    : "Price alert approved: {}", verification.getId());
        } else {
            log.info("Price alert rejected: verification={} reasons={}", verification.getId(), reasons);
        }
    }

    @Transactional
    public void providerError(UUID verificationId, String reason) {
        verificationRepository.findLockedById(verificationId)
                .filter(value -> value.getStatus() == VerificationStatus.PENDING_RECHECK)
                .ifPresent(value -> value.providerError(json(java.util.List.of(reason)), clock.instant()));
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JacksonException exception) {
            return "[\"serialization_error\"]";
        }
    }
}
