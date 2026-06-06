package br.com.culturatech.precoconfirmado.verification.infrastructure;

import br.com.culturatech.precoconfirmado.verification.domain.VerificationAttemptEntity;
import br.com.culturatech.precoconfirmado.verification.domain.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface VerificationAttemptRepository extends JpaRepository<VerificationAttemptEntity, UUID> {
    Page<VerificationAttemptEntity> findByStatusAndRecheckAfterLessThanEqual(
            VerificationStatus status, Instant now, Pageable pageable);

    Page<VerificationAttemptEntity> findByTrackedProductIdOrderByCreatedAtDesc(
            UUID trackedProductId, Pageable pageable);

    boolean existsByTrackedProductIdAndStatus(UUID trackedProductId, VerificationStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from VerificationAttemptEntity v where v.id = :id")
    Optional<VerificationAttemptEntity> findLockedById(UUID id);
}
