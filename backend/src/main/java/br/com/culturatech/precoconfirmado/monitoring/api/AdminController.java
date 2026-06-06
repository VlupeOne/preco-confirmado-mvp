package br.com.culturatech.precoconfirmado.monitoring.api;

import br.com.culturatech.precoconfirmado.monitoring.application.MonitoringCoordinator;
import br.com.culturatech.precoconfirmado.notification.api.OutboxResponse;
import br.com.culturatech.precoconfirmado.notification.application.NotificationDispatcher;
import br.com.culturatech.precoconfirmado.notification.domain.OutboxStatus;
import br.com.culturatech.precoconfirmado.notification.infrastructure.NotificationOutboxRepository;
import br.com.culturatech.precoconfirmado.verification.application.VerificationCoordinator;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Administration")
public class AdminController {
    private final MonitoringCoordinator monitoring;
    private final VerificationCoordinator verification;
    private final NotificationDispatcher notifications;
    private final NotificationOutboxRepository outboxRepository;

    public AdminController(MonitoringCoordinator monitoring, VerificationCoordinator verification,
                           NotificationDispatcher notifications, NotificationOutboxRepository outboxRepository) {
        this.monitoring = monitoring;
        this.verification = verification;
        this.notifications = notifications;
        this.outboxRepository = outboxRepository;
    }

    @PostMapping("/monitoring/run")
    Map<String, Integer> monitor() {
        return Map.of("processed", monitoring.processDue());
    }

    @PostMapping("/monitoring/recheck-pending")
    Map<String, Integer> recheck() {
        return Map.of("processed", verification.processPending());
    }

    @PostMapping("/notifications/dispatch")
    Map<String, Integer> dispatch() {
        return Map.of("processed", notifications.dispatchPending());
    }

    @GetMapping("/notifications/outbox")
    Page<OutboxResponse> outbox(
            @RequestParam(required = false) OutboxStatus status,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        var page = status == null ? outboxRepository.findAll(pageable)
                : outboxRepository.findByStatus(status, pageable);
        return page.map(OutboxResponse::from);
    }
}
