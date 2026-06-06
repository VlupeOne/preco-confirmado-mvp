package br.com.culturatech.precoconfirmado.provider.mock;

import br.com.culturatech.precoconfirmado.provider.domain.PaymentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mock_offers")
public class MockOfferEntity {
    @Id
    private UUID id;
    @Column(name = "external_id", nullable = false, unique = true, length = 120)
    private String externalId;
    @Column(nullable = false, length = 500)
    private String title;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;
    @Column(name = "regular_price", precision = 19, scale = 2)
    private BigDecimal regularPrice;
    @Column(nullable = false, length = 3)
    private String currency;
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 30)
    private PaymentType paymentType;
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
    @Column(name = "coupon_required", nullable = false)
    private boolean couponRequired;
    @Column(name = "coupon_code", length = 120)
    private String couponCode;
    @Column(name = "source_url", nullable = false, length = 2048)
    private String sourceUrl;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MockOfferEntity() {
    }

    public MockOfferEntity(UUID id, String externalId, String title, BigDecimal price,
                           BigDecimal regularPrice, String currency, PaymentType paymentType,
                           String sellerId, String sellerName, String condition, String color,
                           String storage, boolean inStock, Integer availableQuantity,
                           boolean couponRequired, String couponCode, String sourceUrl, Instant updatedAt) {
        this.id = id;
        this.externalId = externalId;
        update(title, price, regularPrice, currency, paymentType, sellerId, sellerName, condition,
                color, storage, inStock, availableQuantity, couponRequired, couponCode, sourceUrl, updatedAt);
    }

    public void update(String title, BigDecimal price, BigDecimal regularPrice, String currency,
                       PaymentType paymentType, String sellerId, String sellerName, String condition,
                       String color, String storage, boolean inStock, Integer availableQuantity,
                       boolean couponRequired, String couponCode, String sourceUrl, Instant updatedAt) {
        this.title = title;
        this.price = price;
        this.regularPrice = regularPrice;
        this.currency = currency;
        this.paymentType = paymentType;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.condition = condition;
        this.color = color;
        this.storage = storage;
        this.inStock = inStock;
        this.availableQuantity = availableQuantity;
        this.couponRequired = couponRequired;
        this.couponCode = couponCode;
        this.sourceUrl = sourceUrl;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public String getExternalId() { return externalId; }
    public String getTitle() { return title; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getRegularPrice() { return regularPrice; }
    public String getCurrency() { return currency; }
    public PaymentType getPaymentType() { return paymentType; }
    public String getSellerId() { return sellerId; }
    public String getSellerName() { return sellerName; }
    public String getCondition() { return condition; }
    public String getColor() { return color; }
    public String getStorage() { return storage; }
    public boolean isInStock() { return inStock; }
    public Integer getAvailableQuantity() { return availableQuantity; }
    public boolean isCouponRequired() { return couponRequired; }
    public String getCouponCode() { return couponCode; }
    public String getSourceUrl() { return sourceUrl; }
    public Instant getUpdatedAt() { return updatedAt; }
}
