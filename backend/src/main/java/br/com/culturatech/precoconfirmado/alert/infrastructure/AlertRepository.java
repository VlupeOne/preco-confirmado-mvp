package br.com.culturatech.precoconfirmado.alert.infrastructure;

import br.com.culturatech.precoconfirmado.alert.domain.AlertEntity;
import br.com.culturatech.precoconfirmado.alert.domain.AlertStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<AlertEntity, UUID> {
    Optional<AlertEntity> findByIdempotencyKey(String idempotencyKey);

    Optional<AlertEntity> findFirstByUserIdAndTrackedProductIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(
            UUID userId, UUID trackedProductId, Instant since);

    @Query("""
            select a from AlertEntity a
            where a.userId = :userId
              and (:status is null or a.status = :status)
              and (:productId is null or a.trackedProductId = :productId)
              and (:readFilter is null or (:readFilter = true and a.readAt is not null)
                   or (:readFilter = false and a.readAt is null))
            """)
    Page<AlertEntity> searchByUser(UUID userId, AlertStatus status, UUID productId,
                                   Boolean readFilter, Pageable pageable);

    @Query("""
            select a from AlertEntity a
            where (:status is null or a.status = :status)
              and (:productId is null or a.trackedProductId = :productId)
              and (:readFilter is null or (:readFilter = true and a.readAt is not null)
                   or (:readFilter = false and a.readAt is null))
            """)
    Page<AlertEntity> searchAll(AlertStatus status, UUID productId, Boolean readFilter, Pageable pageable);

    Page<AlertEntity> findByTrackedProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);
}
