package br.com.culturatech.precoconfirmado.notification.infrastructure;

import br.com.culturatech.precoconfirmado.notification.domain.NotificationChannel;
import br.com.culturatech.precoconfirmado.notification.domain.NotificationGateway;
import br.com.culturatech.precoconfirmado.notification.domain.NotificationMessage;
import br.com.culturatech.precoconfirmado.notification.application.NotificationFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LogNotificationGateway implements NotificationGateway {
    private static final Logger log = LoggerFactory.getLogger(LogNotificationGateway.class);
    private final NotificationFormatter formatter;

    public LogNotificationGateway(NotificationFormatter formatter) {
        this.formatter = formatter;
    }

    @Override
    public NotificationChannel channel() {
        return NotificationChannel.LOG;
    }

    @Override
    public void send(NotificationMessage message) {
        log.info("Price notification sent to {}:\n{}", message.recipient(), formatter.format(message.payload()));
    }
}
