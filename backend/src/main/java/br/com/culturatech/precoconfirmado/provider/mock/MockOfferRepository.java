package br.com.culturatech.precoconfirmado.provider.mock;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MockOfferRepository extends JpaRepository<MockOfferEntity, UUID> {
    Optional<MockOfferEntity> findByExternalId(String externalId);
    boolean existsByExternalId(String externalId);
    void deleteByExternalId(String externalId);
}
