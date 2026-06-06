package br.com.culturatech.precoconfirmado.user.application;

import br.com.culturatech.precoconfirmado.shared.config.DevelopmentProperties;
import br.com.culturatech.precoconfirmado.user.domain.UserEntity;
import br.com.culturatech.precoconfirmado.user.domain.UserRole;
import br.com.culturatech.precoconfirmado.user.infrastructure.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Locale;
import java.util.UUID;

@Component
@Profile("dev")
public class DevelopmentAdminInitializer implements ApplicationRunner {
    private final DevelopmentProperties properties;
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    public DevelopmentAdminInitializer(DevelopmentProperties properties, UserRepository repository,
                                       PasswordEncoder passwordEncoder, Clock clock) {
        this.properties = properties;
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (properties.adminEmail() == null || properties.adminEmail().isBlank()
                || properties.adminPassword() == null || properties.adminPassword().isBlank()) {
            return;
        }
        if (properties.adminPassword().length() < 8) {
            throw new IllegalStateException("DEV_ADMIN_PASSWORD must contain at least 8 characters");
        }
        String email = properties.adminEmail().trim().toLowerCase(Locale.ROOT);
        repository.findByEmail(email).orElseGet(() -> repository.save(new UserEntity(
                UUID.randomUUID(), properties.adminName(), email,
                passwordEncoder.encode(properties.adminPassword()), UserRole.ADMIN, clock.instant())));
    }
}
