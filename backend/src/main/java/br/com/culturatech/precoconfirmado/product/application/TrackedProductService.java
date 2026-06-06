package br.com.culturatech.precoconfirmado.product.application;

import br.com.culturatech.precoconfirmado.product.api.TrackedProductRequest;
import br.com.culturatech.precoconfirmado.product.api.TrackedProductResponse;
import br.com.culturatech.precoconfirmado.product.domain.ProductStatus;
import br.com.culturatech.precoconfirmado.product.domain.TrackedProductEntity;
import br.com.culturatech.precoconfirmado.product.infrastructure.TrackedProductRepository;
import br.com.culturatech.precoconfirmado.shared.exception.ConflictException;
import br.com.culturatech.precoconfirmado.shared.exception.BadRequestException;
import br.com.culturatech.precoconfirmado.shared.exception.NotFoundException;
import br.com.culturatech.precoconfirmado.shared.security.AuthenticatedUser;
import br.com.culturatech.precoconfirmado.shared.util.TextNormalizer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class TrackedProductService {
    private static final Set<String> SUPPORTED_PROVIDERS = Set.of("MOCK", "MERCADO_LIVRE");
    private final TrackedProductRepository repository;
    private final TextNormalizer normalizer;
    private final Clock clock;

    public TrackedProductService(TrackedProductRepository repository, TextNormalizer normalizer, Clock clock) {
        this.repository = repository;
        this.normalizer = normalizer;
        this.clock = clock;
    }

    @Transactional
    public TrackedProductResponse create(AuthenticatedUser user, TrackedProductRequest request) {
        String provider = request.providerCode().trim().toUpperCase(Locale.ROOT);
        if (!SUPPORTED_PROVIDERS.contains(provider)) {
            throw new BadRequestException("Unsupported provider: " + provider);
        }
        String externalId = request.externalId().trim();
        if (repository.existsByUserIdAndProviderCodeAndExternalId(user.id(), provider, externalId)) {
            throw new ConflictException("Este produto já está sendo monitorado.");
        }
        Instant now = clock.instant();
        TrackedProductEntity product = new TrackedProductEntity(
                UUID.randomUUID(), user.id(), provider, externalId, request.sourceUrl().trim(),
                request.title().trim(), normalizer.normalize(request.title()), trim(request.brand()),
                trim(request.model()), trim(request.color()), trim(request.storage()),
                request.condition().trim().toUpperCase(Locale.ROOT), request.targetPrice(),
                request.currency() == null ? "BRL" : request.currency(), request.checkIntervalMinutes(), now);
        return TrackedProductResponse.from(repository.save(product));
    }

    @Transactional(readOnly = true)
    public Page<TrackedProductResponse> list(AuthenticatedUser user, ProductStatus status,
                                             String provider, Pageable pageable) {
        String providerCode = provider == null ? null : provider.toUpperCase(Locale.ROOT);
        Page<TrackedProductEntity> page = user.isAdmin()
                ? repository.searchAll(status, providerCode, pageable)
                : repository.searchByUser(user.id(), status, providerCode, pageable);
        return page.map(TrackedProductResponse::from);
    }

    @Transactional(readOnly = true)
    public TrackedProductEntity requireAccessible(AuthenticatedUser user, UUID id) {
        TrackedProductEntity product = repository.findVisibleById(id)
                .orElseThrow(() -> new NotFoundException("Produto monitorado não encontrado."));
        if (!user.isAdmin() && !product.getUserId().equals(user.id())) {
            throw new NotFoundException("Produto monitorado não encontrado.");
        }
        return product;
    }

    @Transactional(readOnly = true)
    public TrackedProductResponse get(AuthenticatedUser user, UUID id) {
        return TrackedProductResponse.from(requireAccessible(user, id));
    }

    @Transactional
    public TrackedProductResponse update(AuthenticatedUser user, UUID id, TrackedProductRequest request) {
        TrackedProductEntity product = requireAccessible(user, id);
        if (!product.getProviderCode().equalsIgnoreCase(request.providerCode())
                || !product.getExternalId().equals(request.externalId().trim())) {
            throw new ConflictException("Provider e externalId não podem ser alterados.");
        }
        Instant now = clock.instant();
        product.update(request.sourceUrl().trim(), request.title().trim(), normalizer.normalize(request.title()),
                trim(request.brand()), trim(request.model()), trim(request.color()), trim(request.storage()),
                request.condition().trim().toUpperCase(Locale.ROOT), request.targetPrice(),
                request.currency() == null ? "BRL" : request.currency(), request.checkIntervalMinutes(), now);
        return TrackedProductResponse.from(product);
    }

    @Transactional
    public void delete(AuthenticatedUser user, UUID id) {
        requireAccessible(user, id).delete(clock.instant());
    }

    @Transactional
    public TrackedProductResponse pause(AuthenticatedUser user, UUID id) {
        TrackedProductEntity product = requireAccessible(user, id);
        product.pause(clock.instant());
        return TrackedProductResponse.from(product);
    }

    @Transactional
    public TrackedProductResponse resume(AuthenticatedUser user, UUID id) {
        TrackedProductEntity product = requireAccessible(user, id);
        product.resume(clock.instant());
        return TrackedProductResponse.from(product);
    }

    private String trim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
