package br.com.culturatech.precoconfirmado.notification.domain;

public interface NotificationGateway {
    NotificationChannel channel();
    void send(NotificationMessage message);
}
