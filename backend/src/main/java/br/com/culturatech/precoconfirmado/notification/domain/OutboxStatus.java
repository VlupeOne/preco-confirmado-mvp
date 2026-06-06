package br.com.culturatech.precoconfirmado.notification.domain;

public enum OutboxStatus {
    PENDING,
    PROCESSING,
    SENT,
    FAILED,
    DEAD
}
