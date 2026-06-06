package br.com.culturatech.precoconfirmado.product.api;

import br.com.culturatech.precoconfirmado.product.application.TrackedProductService;
import br.com.culturatech.precoconfirmado.product.application.ProductHistoryService;
import br.com.culturatech.precoconfirmado.monitoring.application.MonitoringCoordinator;
import br.com.culturatech.precoconfirmado.monitoring.api.PriceSnapshotResponse;
import br.com.culturatech.precoconfirmado.verification.api.VerificationResponse;
import br.com.culturatech.precoconfirmado.alert.api.AlertResponse;
import br.com.culturatech.precoconfirmado.product.domain.ProductStatus;
import br.com.culturatech.precoconfirmado.shared.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tracked-products")
@Tag(name = "Tracked Products")
public class TrackedProductController {
    private final TrackedProductService service;
    private final ProductHistoryService historyService;
    private final MonitoringCoordinator monitoringCoordinator;

    public TrackedProductController(TrackedProductService service, ProductHistoryService historyService,
                                    MonitoringCoordinator monitoringCoordinator) {
        this.service = service;
        this.historyService = historyService;
        this.monitoringCoordinator = monitoringCoordinator;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastrar produto para monitoramento")
    TrackedProductResponse create(@AuthenticationPrincipal Jwt jwt,
                                  @Valid @RequestBody TrackedProductRequest request) {
        return service.create(AuthenticatedUser.from(jwt), request);
    }

    @GetMapping
    @Operation(summary = "Listar produtos monitorados")
    Page<TrackedProductResponse> list(@AuthenticationPrincipal Jwt jwt,
                                      @RequestParam(required = false) ProductStatus status,
                                      @RequestParam(required = false) String provider,
                                      @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC)
                                      Pageable pageable) {
        return service.list(AuthenticatedUser.from(jwt), status, provider, pageable);
    }

    @GetMapping("/{id}")
    TrackedProductResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.get(AuthenticatedUser.from(jwt), id);
    }

    @PutMapping("/{id}")
    TrackedProductResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                  @Valid @RequestBody TrackedProductRequest request) {
        return service.update(AuthenticatedUser.from(jwt), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        service.delete(AuthenticatedUser.from(jwt), id);
    }

    @PostMapping("/{id}/pause")
    TrackedProductResponse pause(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.pause(AuthenticatedUser.from(jwt), id);
    }

    @PostMapping("/{id}/resume")
    TrackedProductResponse resume(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.resume(AuthenticatedUser.from(jwt), id);
    }

    @GetMapping("/{id}/history")
    Page<PriceSnapshotResponse> history(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                        @PageableDefault(size = 20) Pageable pageable) {
        return historyService.history(AuthenticatedUser.from(jwt), id, pageable);
    }

    @GetMapping("/{id}/verifications")
    Page<VerificationResponse> verifications(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                              @PageableDefault(size = 20) Pageable pageable) {
        return historyService.verifications(AuthenticatedUser.from(jwt), id, pageable);
    }

    @GetMapping("/{id}/alerts")
    Page<AlertResponse> alerts(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                               @PageableDefault(size = 20) Pageable pageable) {
        return historyService.alerts(AuthenticatedUser.from(jwt), id, pageable);
    }

    @PostMapping("/{id}/check-now")
    @ResponseStatus(HttpStatus.ACCEPTED)
    void checkNow(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        monitoringCoordinator.checkNow(AuthenticatedUser.from(jwt), id);
    }
}
