package br.com.culturatech.precoconfirmado.monitoring.infrastructure;

import br.com.culturatech.precoconfirmado.monitoring.domain.PriceSnapshotEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PriceSnapshotRepository extends JpaRepository<PriceSnapshotEntity, UUID> {
    Page<PriceSnapshotEntity> findByTrackedProductIdOrderByObservedAtDesc(UUID trackedProductId, Pageable pageable);
}
