CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    tracked_product_id UUID NOT NULL REFERENCES tracked_products(id),
    verification_attempt_id UUID NOT NULL REFERENCES verification_attempts(id),
    verified_price NUMERIC(19, 2) NOT NULL CHECK (verified_price > 0),
    target_price NUMERIC(19, 2) NOT NULL CHECK (target_price > 0),
    currency VARCHAR(3) NOT NULL,
    confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    confidence VARCHAR(20) NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    payment_type VARCHAR(30) NOT NULL,
    seller_id VARCHAR(120),
    source_url VARCHAR(2048) NOT NULL,
    fingerprint VARCHAR(64) NOT NULL,
    coupon_code VARCHAR(120),
    idempotency_key VARCHAR(64) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('CREATED', 'NOTIFICATION_PENDING', 'NOTIFIED', 'NOTIFICATION_FAILED', 'EXPIRED')),
    created_at TIMESTAMPTZ NOT NULL,
    read_at TIMESTAMPTZ,
    CONSTRAINT uk_alert_idempotency_key UNIQUE (idempotency_key)
);

CREATE TABLE notification_outbox (
    id UUID PRIMARY KEY,
    alert_id UUID NOT NULL REFERENCES alerts(id),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('LOG', 'EMAIL')),
    recipient VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'DEAD')),
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    next_attempt_at TIMESTAMPTZ NOT NULL,
    last_error VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    idempotency_key VARCHAR(64) NOT NULL,
    CONSTRAINT uk_outbox_idempotency_key UNIQUE (idempotency_key)
);
