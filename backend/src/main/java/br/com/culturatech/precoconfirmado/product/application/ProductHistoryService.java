package br.com.culturatech.precoconfirmado.product.application;

import br.com.culturatech.precoconfirmado.alert.api.AlertResponse;
import br.com.culturatech.precoconfirmado.alert.infrastructure.AlertRepository;
import br.com.culturatech.precoconfirmado.monitoring.api.PriceSnapshotResponse;
import br.com.culturatech.precoconfirmado.monitoring.infrastructure.PriceSnapshotRepository;
import br.com.culturatech.precoconfirmado.shared.security.AuthenticatedUser;
import br.com.culturatech.precoconfirmado.verification.api.VerificationResponse;
import br.com.culturatech.precoconfirmado.verification.infrastructure.VerificationAttemptRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProductHistoryService {
    private final TrackedProductService productService;
    private final PriceSnapshotRepository snapshotRepository;
    private final VerificationAttemptRepository verificationRepository;
    private final AlertRepository alertRepository;

    public ProductHistoryService(TrackedProductService productService, PriceSnapshotRepository snapshotRepository,
                                 VerificationAttemptRepository verificationRepository,
                                 AlertRepository alertRepository) {
        this.productService = productService;
        this.snapshotRepository = snapshotRepository;
        this.verificationRepository = verificationRepository;
        this.alertRepository = alertRepository;
    }

    @Transactional(readOnly = true)
    public Page<PriceSnapshotResponse> history(AuthenticatedUser user, UUID productId, Pageable pageable) {
        productService.requireAccessible(user, productId);
        return snapshotRepository.findByTrackedProductIdOrderByObservedAtDesc(productId, pageable)
                .map(PriceSnapshotResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<VerificationResponse> verifications(AuthenticatedUser user, UUID productId, Pageable pageable) {
        productService.requireAccessible(user, productId);
        return verificationRepository.findByTrackedProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(VerificationResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<AlertResponse> alerts(AuthenticatedUser user, UUID productId, Pageable pageable) {
        productService.requireAccessible(user, productId);
        return alertRepository.findByTrackedProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(AlertResponse::from);
    }
}
