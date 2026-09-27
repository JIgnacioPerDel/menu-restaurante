package com.menurestaurante.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Propiedades propias de la aplicación ({@code app.*} en application.yml).
 *
 * @param publicUrl URL pública del frontend; se usa para construir la URL de los QR
 * @param demoData  si es true, carga una carta y mesas de ejemplo cuando la base de datos está vacía
 */
@ConfigurationProperties("app")
public record AppProperties(String publicUrl, boolean demoData, Jwt jwt, Admin admin) {

    public record Jwt(String secret, Duration expiration) {
    }

    /** Administrador que se crea al arrancar si todavía no existe. */
    public record Admin(String username, String password) {
    }
}
