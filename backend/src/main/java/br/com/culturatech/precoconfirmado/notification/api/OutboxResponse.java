package br.com.culturatech.precoconfirmado.notification.api;

import br.com.culturatech.precoconfirmado.notification.domain.NotificationChannel;
import br.com.culturatech.precoconfirmado.notification.domain.NotificationOutboxEntity;
import br.com.culturatech.precoconfirmado.notification.domain.OutboxStatus;

import java.time.Instant;
import java.util.UUID;

public record OutboxResponse(
        UUID id, UUID alertId, NotificationChannel channel, String recipient, OutboxStatus status,
        int attempts, Instant nextAttemptAt, String lastError, Instant createdAt, Instant sentAt
) {
    public static OutboxResponse from(NotificationOutboxEntity value) {
        return new OutboxResponse(value.getId(), value.getAlertId(), value.getChannel(), value.getRecipient(),
                value.getStatus(), value.getAttempts(), value.getNextAttemptAt(), value.getLastError(),
                value.getCreatedAt(), value.getSentAt());
    }
}
