package br.com.culturatech.precoconfirmado.product.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tracked_products")
public class TrackedProductEntity {
    @Id
    private UUID id;
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(name = "provider_code", nullable = false, length = 50)
    private String providerCode;
    @Column(name = "external_id", nullable = false, length = 120)
    private String externalId;
    @Column(name = "source_url", nullable = false, length = 2048)
    private String sourceUrl;
    @Column(nullable = false, length = 500)
    private String title;
    @Column(name = "normalized_title", nullable = false, length = 500)
    private String normalizedTitle;
    @Column(length = 120)
    private String brand;
    @Column(length = 120)
    private String model;
    @Column(length = 80)
    private String color;
    @Column(length = 80)
    private String storage;
    @Column(nullable = false, length = 30)
    private String condition;
    @Column(name = "target_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal targetPrice;
    @Column(nullable = false, length = 3)
    private String currency;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status;
    @Column(name = "check_interval_minutes", nullable = false)
    private int checkIntervalMinutes;
    @Column(name = "last_checked_at")
    private Instant lastCheckedAt;
    @Column(name = "next_check_at", nullable = false)
    private Instant nextCheckAt;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    @Version
    private long version;

    protected TrackedProductEntity() {
    }

    public TrackedProductEntity(UUID id, UUID userId, String providerCode, String externalId,
                                String sourceUrl, String title, String normalizedTitle, String brand,
                                String model, String color, String storage, String condition,
                                BigDecimal targetPrice, String currency, int interval, Instant now) {
        this.id = id;
        this.userId = userId;
        this.providerCode = providerCode;
        this.externalId = externalId;
        this.sourceUrl = sourceUrl;
        this.title = title;
        this.normalizedTitle = normalizedTitle;
        this.brand = brand;
        this.model = model;
        this.color = color;
        this.storage = storage;
        this.condition = condition;
        this.targetPrice = targetPrice;
        this.currency = currency;
        this.status = ProductStatus.ACTIVE;
        this.checkIntervalMinutes = interval;
        this.nextCheckAt = now;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void update(String sourceUrl, String title, String normalizedTitle, String brand, String model,
                       String color, String storage, String condition, BigDecimal targetPrice,
                       String currency, int interval, Instant now) {
        this.sourceUrl = sourceUrl;
        this.title = title;
        this.normalizedTitle = normalizedTitle;
        this.brand = brand;
        this.model = model;
        this.color = color;
        this.storage = storage;
        this.condition = condition;
        this.targetPrice = targetPrice;
        this.currency = currency;
        this.checkIntervalMinutes = interval;
        this.updatedAt = now;
    }

    public void pause(Instant now) { status = ProductStatus.PAUSED; updatedAt = now; }
    public void resume(Instant now) { status = ProductStatus.ACTIVE; nextCheckAt = now; updatedAt = now; }
    public void delete(Instant now) { status = ProductStatus.DELETED; updatedAt = now; }
    public void checked(Instant now) {
        lastCheckedAt = now;
        nextCheckAt = now.plusSeconds(checkIntervalMinutes * 60L);
        updatedAt = now;
    }
    public void providerError(Instant now) {
        lastCheckedAt = now;
        nextCheckAt = now.plusSeconds(checkIntervalMinutes * 60L);
        updatedAt = now;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getProviderCode() { return providerCode; }
    public String getExternalId() { return externalId; }
    public String getSourceUrl() { return sourceUrl; }
    public String getTitle() { return title; }
    public String getNormalizedTitle() { return normalizedTitle; }
    public String getBrand() { return brand; }
    public String getModel() { return model; }
    public String getColor() { return color; }
    public String getStorage() { return storage; }
    public String getCondition() { return condition; }
    public BigDecimal getTargetPrice() { return targetPrice; }
    public String getCurrency() { return currency; }
    public ProductStatus getStatus() { return status; }
    public int getCheckIntervalMinutes() { return checkIntervalMinutes; }
    public Instant getLastCheckedAt() { return lastCheckedAt; }
    public Instant getNextCheckAt() { return nextCheckAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public long getVersion() { return version; }
}
