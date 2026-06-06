package br.com.culturatech.precoconfirmado.notification.application;

import br.com.culturatech.precoconfirmado.alert.infrastructure.AlertRepository;
import br.com.culturatech.precoconfirmado.notification.domain.NotificationMessage;
import br.com.culturatech.precoconfirmado.notification.domain.OutboxRetryPolicy;
import br.com.culturatech.precoconfirmado.notification.domain.OutboxStatus;
import br.com.culturatech.precoconfirmado.notification.infrastructure.NotificationOutboxRepository;
import br.com.culturatech.precoconfirmado.shared.config.NotificationProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.UUID;

@Service
public class OutboxStateService {
    private final NotificationOutboxRepository outboxRepository;
    private final AlertRepository alertRepository;
    private final NotificationProperties properties;
    private final Clock clock;
    private final OutboxRetryPolicy retryPolicy = new OutboxRetryPolicy();

    public OutboxStateService(NotificationOutboxRepository outboxRepository, AlertRepository alertRepository,
                              NotificationProperties properties, Clock clock) {
        this.outboxRepository = outboxRepository;
        this.alertRepository = alertRepository;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public NotificationMessage claim(UUID id) {
        var outbox = outboxRepository.findLockedById(id).orElse(null);
        if (outbox == null || (outbox.getStatus() != OutboxStatus.PENDING
                && outbox.getStatus() != OutboxStatus.FAILED
                && outbox.getStatus() != OutboxStatus.PROCESSING)
                || outbox.getNextAttemptAt().isAfter(clock.instant())) {
            return null;
        }
        outbox.processing(clock.instant().plusSeconds(300));
        return new NotificationMessage(outbox.getId(), outbox.getChannel(), outbox.getRecipient(),
                outbox.getPayload());
    }

    @Transactional
    public void sent(UUID id) {
        var outbox = outboxRepository.findLockedById(id).orElseThrow();
        outbox.sent(clock.instant());
        alertRepository.findById(outbox.getAlertId()).ifPresent(alert -> alert.notified());
    }

    @Transactional
    public void failed(UUID id, Exception exception) {
        var outbox = outboxRepository.findLockedById(id).orElseThrow();
        String error = sanitize(exception);
        if (outbox.getAttempts() >= properties.maxAttempts()) {
            outbox.dead(error);
            alertRepository.findById(outbox.getAlertId()).ifPresent(alert -> alert.notificationFailed());
        } else {
            outbox.retry(clock.instant().plus(retryPolicy.delayAfterFailure(outbox.getAttempts())), error);
        }
    }

    private String sanitize(Exception exception) {
        String message = exception.getMessage();
        String value = exception.getClass().getSimpleName() + (message == null ? "" : ": " + message);
        return value.length() <= 1000 ? value : value.substring(0, 1000);
    }
}
