package br.com.culturatech.precoconfirmado;

import br.com.culturatech.precoconfirmado.alert.domain.AlertStatus;
import br.com.culturatech.precoconfirmado.alert.infrastructure.AlertRepository;
import br.com.culturatech.precoconfirmado.auth.infrastructure.RefreshTokenRepository;
import br.com.culturatech.precoconfirmado.monitoring.infrastructure.PriceSnapshotRepository;
import br.com.culturatech.precoconfirmado.notification.application.NotificationDispatcher;
import br.com.culturatech.precoconfirmado.notification.domain.OutboxStatus;
import br.com.culturatech.precoconfirmado.notification.infrastructure.NotificationOutboxRepository;
import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import br.com.culturatech.precoconfirmado.provider.mock.MockOfferEntity;
import br.com.culturatech.precoconfirmado.provider.mock.MockOfferRepository;
import br.com.culturatech.precoconfirmado.verification.application.VerificationCoordinator;
import br.com.culturatech.precoconfirmado.verification.domain.VerificationStatus;
import br.com.culturatech.precoconfirmado.verification.infrastructure.VerificationAttemptRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.monitoring.verification-recheck-delay=PT0S",
        "app.monitoring.scheduler-delay=PT60S",
        "app.monitoring.enabled=false",
        "app.notifications.channel=LOG"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class PrecoConfirmadoIntegrationTest {
    @Container
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine")
            .withDatabaseName("preco_confirmado_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired MockOfferRepository mockOfferRepository;
    @Autowired PriceSnapshotRepository snapshotRepository;
    @Autowired VerificationAttemptRepository verificationRepository;
    @Autowired AlertRepository alertRepository;
    @Autowired NotificationOutboxRepository outboxRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;
    @Autowired VerificationCoordinator verificationCoordinator;
    @Autowired NotificationDispatcher notificationDispatcher;

    @Test
    void registerLoginRefreshLogoutAndVerifiedAlertFlow() throws Exception {
        Session owner = register("owner-" + UUID.randomUUID() + "@example.com");
        Session other = register("other-" + UUID.randomUUID() + "@example.com");
        Session loggedIn = login(owner.email(), "StrongPassword123");
        assertThat(loggedIn.accessToken()).isNotBlank();

        Session rotated = refresh(loggedIn.refreshToken());
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("{\"refreshToken\":\"%s\"}".formatted(loggedIn.refreshToken()))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + rotated.accessToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("{\"refreshToken\":\"%s\"}".formatted(rotated.refreshToken()))))
                .andExpect(status().isNoContent());
        assertThat(refreshTokenRepository.findByTokenHash(
                br.com.culturatech.precoconfirmado.shared.util.Hashing.sha256(rotated.refreshToken())))
                .get().extracting(value -> value.getRevokedAt()).isNotNull();

        String externalId = "NOTEBOOK-" + UUID.randomUUID();
        mockOfferRepository.save(new MockOfferEntity(UUID.randomUUID(), externalId,
                "Notebook Modelo X 16 GB 512 GB", new BigDecimal("3499.00"),
                new BigDecimal("3999.00"), "BRL", PaymentType.PIX, "SELLER-1",
                "Loja Exemplo", "NEW", "Preto", "512GB", true, 5,
                false, null, "https://example.test/" + externalId, Instant.now()));

        String productBody = """
                {
                  "providerCode":"MOCK",
                  "externalId":"%s",
                  "sourceUrl":"https://example.test/%s",
                  "title":"Notebook Modelo X 16 GB 512 GB",
                  "brand":"Marca",
                  "model":"Modelo X",
                  "color":"Preto",
                  "storage":"512GB",
                  "condition":"NEW",
                  "targetPrice":3500.00,
                  "currency":"BRL",
                  "checkIntervalMinutes":30
                }
                """.formatted(externalId, externalId);
        String created = mockMvc.perform(post("/api/v1/tracked-products")
                        .header("Authorization", "Bearer " + owner.accessToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        UUID productId = UUID.fromString(objectMapper.readTree(created).path("id").asText());

        mockMvc.perform(get("/api/v1/tracked-products/{id}", productId)
                        .header("Authorization", "Bearer " + other.accessToken()))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/v1/tracked-products/{id}/check-now", productId)
                        .header("Authorization", "Bearer " + owner.accessToken()))
                .andExpect(status().isAccepted());
        assertThat(snapshotRepository.count()).isEqualTo(1);
        assertThat(verificationRepository.findAll())
                .singleElement()
                .extracting(value -> value.getStatus())
                .isEqualTo(VerificationStatus.PENDING_RECHECK);

        assertThat(verificationCoordinator.processPending()).isEqualTo(1);
        assertThat(snapshotRepository.count()).isEqualTo(2);
        assertThat(alertRepository.findAll()).singleElement()
                .extracting(value -> value.getStatus()).isEqualTo(AlertStatus.NOTIFICATION_PENDING);
        assertThat(outboxRepository.findAll()).singleElement()
                .extracting(value -> value.getStatus()).isEqualTo(OutboxStatus.PENDING);

        assertThat(notificationDispatcher.dispatchPending()).isEqualTo(1);
        assertThat(outboxRepository.findAll()).singleElement()
                .extracting(value -> value.getStatus()).isEqualTo(OutboxStatus.SENT);
        assertThat(alertRepository.findAll()).singleElement()
                .extracting(value -> value.getStatus()).isEqualTo(AlertStatus.NOTIFIED);

        mockMvc.perform(post("/api/v1/tracked-products/{id}/check-now", productId)
                        .header("Authorization", "Bearer " + owner.accessToken()))
                .andExpect(status().isAccepted());
        assertThat(verificationCoordinator.processPending()).isEqualTo(1);
        assertThat(alertRepository.count()).isEqualTo(1);
        assertThat(outboxRepository.count()).isEqualTo(1);
    }

    private Session register(String email) throws Exception {
        String body = """
                {"name":"Test User","email":"%s","password":"StrongPassword123"}
                """.formatted(email);
        String response = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return session(email, response);
    }

    private Session login(String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return session(email, response);
    }

    private Session refresh(String refreshToken) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("{\"refreshToken\":\"%s\"}".formatted(refreshToken))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return session("", response);
    }

    private Session session(String email, String response) throws Exception {
        JsonNode node = objectMapper.readTree(response);
        return new Session(email, node.path("accessToken").asText(), node.path("refreshToken").asText());
    }

    private String json(String value) {
        return value;
    }

    private record Session(String email, String accessToken, String refreshToken) {
    }
}
