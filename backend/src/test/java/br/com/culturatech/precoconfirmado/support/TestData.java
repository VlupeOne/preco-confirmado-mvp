package br.com.culturatech.precoconfirmado.support;

import br.com.culturatech.precoconfirmado.monitoring.domain.PriceSnapshotEntity;
import br.com.culturatech.precoconfirmado.product.domain.TrackedProductEntity;
import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import br.com.culturatech.precoconfirmado.shared.util.Hashing;
import br.com.culturatech.precoconfirmado.shared.util.TextNormalizer;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public final class TestData {
    public static final Instant NOW = Instant.parse("2026-06-05T17:32:00Z");
    private static final TextNormalizer NORMALIZER = new TextNormalizer();

    private TestData() {
    }

    public static TrackedProductEntity product() {
        return new TrackedProductEntity(UUID.randomUUID(), UUID.randomUUID(), "MOCK", "NOTEBOOK-001",
                "https://example.test/notebook", "Notebook Modelo X 16 GB 512 GB",
                NORMALIZER.normalize("Notebook Modelo X 16 GB 512 GB"), "Marca", "Modelo X",
                "Preto", "512GB", "NEW", new BigDecimal("3500.00"), "BRL", 30, NOW);
    }

    public static PriceSnapshotEntity snapshot(TrackedProductEntity product, String externalId,
                                               BigDecimal price, boolean stock, String seller,
                                               PaymentType payment, Instant observedAt) {
        String title = "Notebook Modelo X 16 GB 512 GB";
        String canonical = externalId + "|" + price + "|" + seller + "|" + payment;
        return new PriceSnapshotEntity(UUID.randomUUID(), product.getId(), "MOCK", externalId,
                title, NORMALIZER.normalize(title), price, new BigDecimal("3999.00"), "BRL",
                payment, null, null, false, null, seller, "Loja", "NEW", "Preto",
                "512GB", stock, stock ? 3 : 0, "https://example.test/notebook", observedAt,
                Hashing.sha256(canonical), "{}");
    }
}
