package br.com.culturatech.precoconfirmado.notification.infrastructure;

import br.com.culturatech.precoconfirmado.notification.domain.NotificationChannel;
import br.com.culturatech.precoconfirmado.notification.domain.NotificationGateway;
import br.com.culturatech.precoconfirmado.notification.domain.NotificationMessage;
import br.com.culturatech.precoconfirmado.notification.application.NotificationFormatter;
import br.com.culturatech.precoconfirmado.shared.config.NotificationProperties;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailNotificationGateway implements NotificationGateway {
    private final JavaMailSender mailSender;
    private final NotificationProperties properties;
    private final NotificationFormatter formatter;

    public EmailNotificationGateway(JavaMailSender mailSender, NotificationProperties properties,
                                    NotificationFormatter formatter) {
        this.mailSender = mailSender;
        this.properties = properties;
        this.formatter = formatter;
    }

    @Override
    public NotificationChannel channel() {
        return NotificationChannel.EMAIL;
    }

    @Override
    public void send(NotificationMessage message) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(properties.mailFrom());
        mail.setTo(message.recipient());
        mail.setSubject("Preço confirmado");
        mail.setText(formatter.format(message.payload()));
        mailSender.send(mail);
    }
}
