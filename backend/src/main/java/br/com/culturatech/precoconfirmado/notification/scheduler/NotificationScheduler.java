package br.com.culturatech.precoconfirmado.notification.scheduler;

import br.com.culturatech.precoconfirmado.notification.application.NotificationDispatcher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NotificationScheduler {
    private final NotificationDispatcher dispatcher;

    public NotificationScheduler(NotificationDispatcher dispatcher) {
        this.dispatcher = dispatcher;
    }

    @Scheduled(fixedDelayString = "${app.notifications.scheduler-delay:PT30S}")
    public void dispatch() {
        dispatcher.dispatchPending();
    }
}
