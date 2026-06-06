package br.com.culturatech.precoconfirmado.notification.domain;

import java.time.Duration;

public class OutboxRetryPolicy {
    public Duration delayAfterFailure(int completedAttempts) {
        return switch (completedAttempts) {
            case 1 -> Duration.ofMinutes(1);
            case 2 -> Duration.ofMinutes(5);
            case 3 -> Duration.ofMinutes(30);
            case 4 -> Duration.ofHours(2);
            default -> Duration.ZERO;
        };
    }
}
