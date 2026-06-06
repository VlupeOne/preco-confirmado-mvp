package br.com.culturatech.precoconfirmado.notification.application;

import br.com.culturatech.precoconfirmado.notification.domain.NotificationChannel;
import br.com.culturatech.precoconfirmado.notification.domain.NotificationGateway;
import br.com.culturatech.precoconfirmado.notification.infrastructure.NotificationOutboxRepository;
import br.com.culturatech.precoconfirmado.shared.config.MonitoringProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class NotificationDispatcher {
    private static final Logger log = LoggerFactory.getLogger(NotificationDispatcher.class);
    private final NotificationOutboxRepository repository;
    private final OutboxStateService stateService;
    private final Map<NotificationChannel, NotificationGateway> gateways;
    private final MonitoringProperties monitoringProperties;
    private final Clock clock;

    public NotificationDispatcher(NotificationOutboxRepository repository, OutboxStateService stateService,
                                  java.util.List<NotificationGateway> gateways,
                                  MonitoringProperties monitoringProperties, Clock clock) {
        this.repository = repository;
        this.stateService = stateService;
        this.gateways = gateways.stream().collect(Collectors.toUnmodifiableMap(
                NotificationGateway::channel, Function.identity()));
        this.monitoringProperties = monitoringProperties;
        this.clock = clock;
    }

    public int dispatchPending() {
        var page = repository.findDispatchable(clock.instant(),
                PageRequest.of(0, monitoringProperties.batchSize(),
                        Sort.by("nextAttemptAt").ascending()));
        page.forEach(outbox -> {
            var message = stateService.claim(outbox.getId());
            if (message == null) {
                return;
            }
            try {
                NotificationGateway gateway = gateways.get(message.channel());
                if (gateway == null) {
                    throw new IllegalStateException("Notification channel unavailable: " + message.channel());
                }
                gateway.send(message);
                stateService.sent(message.outboxId());
                log.info("Outbox notification sent: {}", message.outboxId());
            } catch (Exception exception) {
                stateService.failed(message.outboxId(), exception);
                log.warn("Outbox notification failed: {} ({})",
                        message.outboxId(), exception.getClass().getSimpleName());
            }
        });
        return page.getNumberOfElements();
    }
}
