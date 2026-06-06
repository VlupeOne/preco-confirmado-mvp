package br.com.culturatech.precoconfirmado.alert.application;

import br.com.culturatech.precoconfirmado.alert.api.AlertResponse;
import br.com.culturatech.precoconfirmado.alert.domain.AlertEntity;
import br.com.culturatech.precoconfirmado.alert.domain.AlertStatus;
import br.com.culturatech.precoconfirmado.alert.infrastructure.AlertRepository;
import br.com.culturatech.precoconfirmado.shared.exception.NotFoundException;
import br.com.culturatech.precoconfirmado.shared.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.UUID;

@Service
public class AlertQueryService {
    private final AlertRepository repository;
    private final Clock clock;

    public AlertQueryService(AlertRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public Page<AlertResponse> list(AuthenticatedUser user, AlertStatus status, UUID productId,
                                    Boolean read, Pageable pageable) {
        Page<AlertEntity> page = user.isAdmin()
                ? repository.searchAll(status, productId, read, pageable)
                : repository.searchByUser(user.id(), status, productId, read, pageable);
        return page.map(AlertResponse::from);
    }

    @Transactional(readOnly = true)
    public AlertResponse get(AuthenticatedUser user, UUID id) {
        return AlertResponse.from(requireAccessible(user, id));
    }

    @Transactional
    public AlertResponse read(AuthenticatedUser user, UUID id) {
        AlertEntity alert = requireAccessible(user, id);
        if (alert.getReadAt() == null) {
            alert.markRead(clock.instant());
        }
        return AlertResponse.from(alert);
    }

    private AlertEntity requireAccessible(AuthenticatedUser user, UUID id) {
        AlertEntity alert = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Alerta não encontrado."));
        if (!user.isAdmin() && !alert.getUserId().equals(user.id())) {
            throw new NotFoundException("Alerta não encontrado.");
        }
        return alert;
    }
}
