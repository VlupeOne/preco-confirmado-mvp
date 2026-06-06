package br.com.culturatech.precoconfirmado.alert.application;

import br.com.culturatech.precoconfirmado.alert.domain.AlertEntity;
import br.com.culturatech.precoconfirmado.alert.domain.AlertIdempotency;
import br.com.culturatech.precoconfirmado.alert.domain.DuplicateAlertPolicy;
import br.com.culturatech.precoconfirmado.alert.infrastructure.AlertRepository;
import br.com.culturatech.precoconfirmado.monitoring.domain.PriceSnapshotEntity;
import br.com.culturatech.precoconfirmado.notification.domain.NotificationOutboxEntity;
import br.com.culturatech.precoconfirmado.notification.infrastructure.NotificationOutboxRepository;
import br.com.culturatech.precoconfirmado.product.domain.TrackedProductEntity;
import br.com.culturatech.precoconfirmado.shared.config.AlertProperties;
import br.com.culturatech.precoconfirmado.shared.config.NotificationProperties;
import br.com.culturatech.precoconfirmado.shared.exception.NotFoundException;
import br.com.culturatech.precoconfirmado.shared.util.Hashing;
import br.com.culturatech.precoconfirmado.user.domain.UserEntity;
import br.com.culturatech.precoconfirmado.user.infrastructure.UserRepository;
import br.com.culturatech.precoconfirmado.verification.domain.ConfidenceScoreResult;
import br.com.culturatech.precoconfirmado.verification.domain.VerificationAttemptEntity;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AlertCreationService {
    private final AlertRepository alertRepository;
    private final NotificationOutboxRepository outboxRepository;
    private final UserRepository userRepository;
    private final AlertProperties alertProperties;
    private final NotificationProperties notificationProperties;
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final DuplicateAlertPolicy duplicatePolicy = new DuplicateAlertPolicy();

    public AlertCreationService(AlertRepository alertRepository, NotificationOutboxRepository outboxRepository,
                                UserRepository userRepository, AlertProperties alertProperties,
                                NotificationProperties notificationProperties, ObjectMapper objectMapper, Clock clock) {
        this.alertRepository = alertRepository;
        this.outboxRepository = outboxRepository;
        this.userRepository = userRepository;
        this.alertProperties = alertProperties;
        this.notificationProperties = notificationProperties;
        this.objectMapper = objectMapper;
        this.clock = clock;
    }

    @Transactional
    public AlertEntity createIfAllowed(TrackedProductEntity product, VerificationAttemptEntity verification,
                                       PriceSnapshotEntity snapshot, ConfidenceScoreResult score) {
        Instant now = clock.instant();
        Instant since = now.minus(alertProperties.duplicateCooldown());
        var latest = alertRepository
                .findFirstByUserIdAndTrackedProductIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(
                        product.getUserId(), product.getId(), since);
        if (latest.isPresent() && duplicatePolicy.shouldSuppress(
                latest.get(), snapshot, alertProperties.minimumAdditionalDropPercent())) {
            return null;
        }
        String key = AlertIdempotency.key(product.getUserId(), product.getId(), snapshot,
                now, alertProperties.duplicateCooldown());
        if (alertRepository.findByIdempotencyKey(key).isPresent()) {
            return null;
        }
        UserEntity user = userRepository.findById(product.getUserId())
                .orElseThrow(() -> new NotFoundException("Usuário do produto não encontrado."));
        AlertEntity alert = alertRepository.save(new AlertEntity(
                UUID.randomUUID(), product.getUserId(), product.getId(), verification.getId(),
                snapshot.getPrice(), product.getTargetPrice(), snapshot.getCurrency(), score.score(),
                score.confidence(), snapshot.getPaymentType(), snapshot.getSellerId(), snapshot.getSourceUrl(),
                snapshot.getFingerprint(), snapshot.getCouponCode(), key, now));
        String outboxKey = Hashing.sha256(alert.getId() + "|" + notificationProperties.channel());
        outboxRepository.save(new NotificationOutboxEntity(
                UUID.randomUUID(), alert.getId(), notificationProperties.channel(), user.getEmail(),
                payload(product, snapshot, score), now, outboxKey));
        return alert;
    }

    private String payload(TrackedProductEntity product, PriceSnapshotEntity snapshot,
                           ConfidenceScoreResult score) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("title", product.getTitle());
        payload.put("variant", String.join(" ", nonNull(product.getColor()), nonNull(product.getStorage())).trim());
        payload.put("verifiedPrice", snapshot.getPrice());
        payload.put("targetPrice", product.getTargetPrice());
        payload.put("currency", snapshot.getCurrency());
        payload.put("paymentType", snapshot.getPaymentType());
        payload.put("coupon", snapshot.getCouponCode());
        payload.put("seller", snapshot.getSellerName());
        payload.put("inStock", snapshot.isInStock());
        payload.put("sourceUrl", snapshot.getSourceUrl());
        payload.put("verifiedAt", snapshot.getObservedAt());
        payload.put("confidence", score.confidence());
        payload.put("score", score.score());
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JacksonException exception) {
            throw new IllegalStateException("Unable to serialize notification payload", exception);
        }
    }

    private String nonNull(String value) {
        return value == null ? "" : value;
    }
}
