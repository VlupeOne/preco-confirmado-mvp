package br.com.culturatech.precoconfirmado.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.development")
public record DevelopmentProperties(String adminEmail, String adminPassword, String adminName) {
}
