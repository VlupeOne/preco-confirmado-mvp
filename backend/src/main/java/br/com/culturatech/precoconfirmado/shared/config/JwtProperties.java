package br.com.culturatech.precoconfirmado.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties("app.jwt")
public record JwtProperties(String secret, Duration accessExpiration, Duration refreshExpiration) {
}
