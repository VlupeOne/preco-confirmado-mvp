CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_tracked_products_user_id ON tracked_products(user_id);
CREATE INDEX idx_tracked_products_status ON tracked_products(status);
CREATE INDEX idx_tracked_products_provider ON tracked_products(provider_code);
CREATE INDEX idx_tracked_products_next_check ON tracked_products(next_check_at) WHERE status = 'ACTIVE';
CREATE INDEX idx_snapshots_product_observed ON price_snapshots(tracked_product_id, observed_at DESC);
CREATE INDEX idx_verifications_product_created ON verification_attempts(tracked_product_id, created_at DESC);
CREATE INDEX idx_verifications_pending ON verification_attempts(recheck_after) WHERE status = 'PENDING_RECHECK';
CREATE UNIQUE INDEX uk_verifications_one_pending_per_product
    ON verification_attempts(tracked_product_id)
    WHERE status = 'PENDING_RECHECK';
CREATE INDEX idx_alerts_user_created ON alerts(user_id, created_at DESC);
CREATE INDEX idx_alerts_product_created ON alerts(tracked_product_id, created_at DESC);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_outbox_pending ON notification_outbox(next_attempt_at) WHERE status IN ('PENDING', 'FAILED', 'PROCESSING');
CREATE INDEX idx_outbox_status ON notification_outbox(status);
