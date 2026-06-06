package br.com.culturatech.precoconfirmado.shared.config;

import br.com.culturatech.precoconfirmado.notification.domain.NotificationChannel;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.notifications")
public record NotificationProperties(NotificationChannel channel, String mailFrom, int maxAttempts) {
}
