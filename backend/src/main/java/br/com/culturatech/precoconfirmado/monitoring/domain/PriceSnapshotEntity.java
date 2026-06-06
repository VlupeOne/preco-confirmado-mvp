package br.com.culturatech.precoconfirmado.monitoring.domain;

import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "price_snapshots")
public class PriceSnapshotEntity {
    @Id
    private UUID id;
    @Column(name = "tracked_product_id", nullable = false)
    private UUID trackedProductId;
    @Column(name = "provider_code", nullable = false, length = 50)
    private String providerCode;
    @Column(name = "external_id", nullable = false, length = 120)
    private String externalId;
    @Column(nullable = false, length = 500)
    private String title;
    @Column(name = "normalized_title", nullable = false, length = 500)
    private String normalizedTitle;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;
    @Column(name = "regular_price", precision = 19, scale = 2)
    private BigDecimal regularPrice;
    @Column(nullable = false, length = 3)
    private String currency;
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 30)
    private PaymentType paymentType;
    @Column(name = "installment_count")
    private Integer installmentCount;
    @Column(name = "installment_amount", precision = 19, scale = 2)
    private BigDecimal installmentAmount;
    @Column(name = "coupon_required", nullable = false)
    private boolean couponRequired;
    @Column(name = "coupon_code", length = 120)
    private String couponCode;
    @Column(name = "seller_id", length = 120)
    private String sellerId;
    @Column(name = "seller_name", length = 255)
    private String sellerName;
    @Column(nullable = false, length = 30)
    private String condition;
    @Column(length = 80)
    private String color;
    @Column(length = 80)
    private String storage;
    @Column(name = "in_stock", nullable = false)
    private boolean inStock;
    @Column(name = "available_quantity")
    private Integer availableQuantity;
    @Column(name = "source_url", nullable = false, length = 2048)
    private String sourceUrl;
    @Column(name = "observed_at", nullable = false)
    private Instant observedAt;
    @Column(nullable = false, length = 64)
    private String fingerprint;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_payload", columnDefinition = "jsonb")
    private String rawPayload;

    protected PriceSnapshotEntity() {
    }

    public PriceSnapshotEntity(UUID id, UUID trackedProductId, String providerCode, String externalId,
                               String title, String normalizedTitle, BigDecimal price, BigDecimal regularPrice,
                               String currency, PaymentType paymentType, Integer installmentCount,
                               BigDecimal installmentAmount, boolean couponRequired, String couponCode,
                               String sellerId, String sellerName, String condition, String color, String storage,
                               boolean inStock, Integer availableQuantity, String sourceUrl, Instant observedAt,
                               String fingerprint, String rawPayload) {
        this.id = id;
        this.trackedProductId = trackedProductId;
        this.providerCode = providerCode;
        this.externalId = externalId;
        this.title = title;
        this.normalizedTitle = normalizedTitle;
        this.price = price;
        this.regularPrice = regularPrice;
        this.currency = currency;
        this.paymentType = paymentType;
        this.installmentCount = installmentCount;
        this.installmentAmount = installmentAmount;
        this.couponRequired = couponRequired;
        this.couponCode = couponCode;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.condition = condition;
        this.color = color;
        this.storage = storage;
        this.inStock = inStock;
        this.availableQuantity = availableQuantity;
        this.sourceUrl = sourceUrl;
        this.observedAt = observedAt;
        this.fingerprint = fingerprint;
        this.rawPayload = rawPayload;
    }

    public UUID getId() { return id; }
    public UUID getTrackedProductId() { return trackedProductId; }
    public String getProviderCode() { return providerCode; }
    public String getExternalId() { return externalId; }
    public String getTitle() { return title; }
    public String getNormalizedTitle() { return normalizedTitle; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getRegularPrice() { return regularPrice; }
    public String getCurrency() { return currency; }
    public PaymentType getPaymentType() { return paymentType; }
    public Integer getInstallmentCount() { return installmentCount; }
    public BigDecimal getInstallmentAmount() { return installmentAmount; }
    public boolean isCouponRequired() { return couponRequired; }
    public String getCouponCode() { return couponCode; }
    public String getSellerId() { return sellerId; }
    public String getSellerName() { return sellerName; }
    public String getCondition() { return condition; }
    public String getColor() { return color; }
    public String getStorage() { return storage; }
    public boolean isInStock() { return inStock; }
    public Integer getAvailableQuantity() { return availableQuantity; }
    public String getSourceUrl() { return sourceUrl; }
    public Instant getObservedAt() { return observedAt; }
    public String getFingerprint() { return fingerprint; }
    public String getRawPayload() { return rawPayload; }
}
