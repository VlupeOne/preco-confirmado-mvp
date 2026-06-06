package br.com.culturatech.precoconfirmado.monitoring.scheduler;

import br.com.culturatech.precoconfirmado.monitoring.application.MonitoringCoordinator;
import br.com.culturatech.precoconfirmado.shared.config.MonitoringProperties;
import br.com.culturatech.precoconfirmado.verification.application.VerificationCoordinator;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MonitoringScheduler {
    private final MonitoringCoordinator monitoringCoordinator;
    private final VerificationCoordinator verificationCoordinator;
    private final MonitoringProperties properties;

    public MonitoringScheduler(MonitoringCoordinator monitoringCoordinator,
                               VerificationCoordinator verificationCoordinator,
                               MonitoringProperties properties) {
        this.monitoringCoordinator = monitoringCoordinator;
        this.verificationCoordinator = verificationCoordinator;
        this.properties = properties;
    }

    @Scheduled(fixedDelayString = "${app.monitoring.scheduler-delay:PT60S}")
    public void monitorDueProducts() {
        if (properties.enabled()) {
            monitoringCoordinator.processDue();
        }
    }

    @Scheduled(fixedDelayString = "${app.monitoring.scheduler-delay:PT60S}")
    public void recheckPendingVerifications() {
        if (properties.enabled()) {
            verificationCoordinator.processPending();
        }
    }
}
