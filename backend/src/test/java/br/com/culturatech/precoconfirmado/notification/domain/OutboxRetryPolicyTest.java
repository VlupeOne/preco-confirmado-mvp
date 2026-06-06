package br.com.culturatech.precoconfirmado.notification.domain;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class OutboxRetryPolicyTest {
    private final OutboxRetryPolicy policy = new OutboxRetryPolicy();

    @Test
    void followsRetrySchedule() {
        assertThat(policy.delayAfterFailure(1)).isEqualTo(Duration.ofMinutes(1));
        assertThat(policy.delayAfterFailure(2)).isEqualTo(Duration.ofMinutes(5));
        assertThat(policy.delayAfterFailure(3)).isEqualTo(Duration.ofMinutes(30));
        assertThat(policy.delayAfterFailure(4)).isEqualTo(Duration.ofHours(2));
        assertThat(policy.delayAfterFailure(5)).isZero();
    }
}
