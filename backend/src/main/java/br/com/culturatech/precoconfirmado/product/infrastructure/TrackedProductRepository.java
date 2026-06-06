package br.com.culturatech.precoconfirmado.product.infrastructure;

import br.com.culturatech.precoconfirmado.product.domain.ProductStatus;
import br.com.culturatech.precoconfirmado.product.domain.TrackedProductEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface TrackedProductRepository extends JpaRepository<TrackedProductEntity, UUID> {
    boolean existsByUserIdAndProviderCodeAndExternalId(UUID userId, String providerCode, String externalId);

    @Query("""
            select p from TrackedProductEntity p
            where p.id = :id and p.status <> br.com.culturatech.precoconfirmado.product.domain.ProductStatus.DELETED
            """)
    Optional<TrackedProductEntity> findVisibleById(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select p from TrackedProductEntity p
            where p.id = :id and p.status <> br.com.culturatech.precoconfirmado.product.domain.ProductStatus.DELETED
            """)
    Optional<TrackedProductEntity> findLockedVisibleById(UUID id);

    @Query("""
            select p from TrackedProductEntity p
            where p.userId = :userId
              and p.status <> br.com.culturatech.precoconfirmado.product.domain.ProductStatus.DELETED
              and (:status is null or p.status = :status)
              and (:provider is null or p.providerCode = :provider)
            """)
    Page<TrackedProductEntity> searchByUser(UUID userId, ProductStatus status, String provider, Pageable pageable);

    @Query("""
            select p from TrackedProductEntity p
            where p.status <> br.com.culturatech.precoconfirmado.product.domain.ProductStatus.DELETED
              and (:status is null or p.status = :status)
              and (:provider is null or p.providerCode = :provider)
            """)
    Page<TrackedProductEntity> searchAll(ProductStatus status, String provider, Pageable pageable);

    Page<TrackedProductEntity> findByStatusAndNextCheckAtLessThanEqual(
            ProductStatus status, Instant now, Pageable pageable);
}
