package br.com.culturatech.precoconfirmado.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties("app.mercado-livre")
public record MercadoLivreProperties(boolean enabled, String baseUrl, String accessToken,
                                     Duration connectTimeout, Duration readTimeout) {
}
