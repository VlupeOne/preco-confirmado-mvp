package br.com.culturatech.precoconfirmado.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;
import java.time.Duration;

@ConfigurationProperties("app.alerts")
public record AlertProperties(Duration duplicateCooldown, BigDecimal minimumAdditionalDropPercent) {
}
