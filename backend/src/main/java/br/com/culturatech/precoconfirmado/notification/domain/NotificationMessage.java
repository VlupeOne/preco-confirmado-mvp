package br.com.culturatech.precoconfirmado.notification.domain;

import java.util.UUID;

public record NotificationMessage(UUID outboxId, NotificationChannel channel,
                                  String recipient, String payload) {
}
