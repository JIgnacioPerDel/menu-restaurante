package com.menurestaurante.security;

import com.menurestaurante.config.AppProperties;
import com.menurestaurante.model.AppUser;
import com.menurestaurante.model.Role;
import com.menurestaurante.repository.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Crea el usuario administrador a partir de ADMIN_USERNAME / ADMIN_PASSWORD si todavía no existe.
 * Así no hay credenciales reales en el código ni en las migraciones.
 */
@Component
@Order(0)
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties properties;

    public AdminBootstrap(AppUserRepository userRepository, PasswordEncoder passwordEncoder, AppProperties properties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String username = properties.admin().username();
        if (userRepository.existsByUsername(username)) {
            return;
        }
        String password = properties.admin().password();
        if (password == null || password.isBlank()) {
            throw new IllegalStateException(
                    "No existe el administrador '" + username + "' y ADMIN_PASSWORD no está definido");
        }
        userRepository.save(new AppUser(username, passwordEncoder.encode(password), Role.ADMIN));
        log.info("Usuario administrador '{}' creado", username);
    }
}
