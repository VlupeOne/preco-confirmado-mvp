package br.com.culturatech.precoconfirmado.notification.infrastructure;

import br.com.culturatech.precoconfirmado.notification.domain.NotificationOutboxEntity;
import br.com.culturatech.precoconfirmado.notification.domain.OutboxStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface NotificationOutboxRepository extends JpaRepository<NotificationOutboxEntity, UUID> {
    @Query("""
            select o from NotificationOutboxEntity o
            where o.status in (
                br.com.culturatech.precoconfirmado.notification.domain.OutboxStatus.PENDING,
                br.com.culturatech.precoconfirmado.notification.domain.OutboxStatus.FAILED,
                br.com.culturatech.precoconfirmado.notification.domain.OutboxStatus.PROCESSING
            ) and o.nextAttemptAt <= :now
            """)
    Page<NotificationOutboxEntity> findDispatchable(Instant now, Pageable pageable);

    Page<NotificationOutboxEntity> findByStatus(OutboxStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from NotificationOutboxEntity o where o.id = :id")
    Optional<NotificationOutboxEntity> findLockedById(UUID id);
}
