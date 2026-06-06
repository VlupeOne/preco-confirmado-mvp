package br.com.culturatech.precoconfirmado.alert.domain;

import br.com.culturatech.precoconfirmado.monitoring.domain.PriceSnapshotEntity;
import br.com.culturatech.precoconfirmado.shared.util.Hashing;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

public final class AlertIdempotency {
    private AlertIdempotency() {
    }

    public static String key(UUID userId, UUID productId, PriceSnapshotEntity snapshot,
                             Instant observedAt, Duration cooldown) {
        long bucketSeconds = Math.max(1, cooldown.toSeconds());
        long cooldownBucket = Math.floorDiv(observedAt.getEpochSecond(), bucketSeconds);
        return Hashing.sha256(String.join("|", userId.toString(), productId.toString(),
                snapshot.getPrice().toPlainString(), value(snapshot.getSellerId()),
                snapshot.getPaymentType().name(), value(snapshot.getCouponCode()), snapshot.getFingerprint(),
                Long.toString(cooldownBucket)));
    }

    private static String value(String value) {
        return value == null ? "" : value;
    }
}
