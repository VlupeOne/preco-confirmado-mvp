CREATE TABLE verification_attempts (
    id UUID PRIMARY KEY,
    tracked_product_id UUID NOT NULL REFERENCES tracked_products(id),
    first_snapshot_id UUID NOT NULL REFERENCES price_snapshots(id),
    second_snapshot_id UUID REFERENCES price_snapshots(id),
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING_RECHECK', 'APPROVED', 'REJECTED', 'EXPIRED', 'PROVIDER_ERROR')),
    score INTEGER CHECK (score IS NULL OR score BETWEEN 0 AND 100),
    confidence VARCHAR(20) CHECK (confidence IS NULL OR confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL,
    recheck_after TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);
