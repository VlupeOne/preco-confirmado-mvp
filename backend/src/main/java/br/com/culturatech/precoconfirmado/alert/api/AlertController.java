package br.com.culturatech.precoconfirmado.alert.api;

import br.com.culturatech.precoconfirmado.alert.application.AlertQueryService;
import br.com.culturatech.precoconfirmado.alert.domain.AlertStatus;
import br.com.culturatech.precoconfirmado.shared.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
@Tag(name = "Alerts")
public class AlertController {
    private final AlertQueryService service;

    public AlertController(AlertQueryService service) {
        this.service = service;
    }

    @GetMapping
    Page<AlertResponse> list(@AuthenticationPrincipal Jwt jwt,
                             @RequestParam(required = false) AlertStatus status,
                             @RequestParam(required = false) UUID productId,
                             @RequestParam(required = false) Boolean read,
                             @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC)
                             Pageable pageable) {
        return service.list(AuthenticatedUser.from(jwt), status, productId, read, pageable);
    }

    @GetMapping("/{id}")
    AlertResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.get(AuthenticatedUser.from(jwt), id);
    }

    @PatchMapping("/{id}/read")
    AlertResponse read(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.read(AuthenticatedUser.from(jwt), id);
    }
}
