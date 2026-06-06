package br.com.culturatech.precoconfirmado.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties("app.monitoring")
public record MonitoringProperties(boolean enabled, int batchSize, Duration schedulerDelay,
                                   Duration verificationRecheckDelay) {
}
