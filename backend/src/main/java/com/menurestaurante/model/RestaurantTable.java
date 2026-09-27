package com.menurestaurante.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * Mesa del local. El QR apunta a su {@code token}, que es aleatorio para que no se pueda
 * adivinar el de otra mesa cambiando la URL.
 */
@Entity
@Table(name = "restaurant_tables")
public class RestaurantTable extends BaseEntity {

    @Column(nullable = false, unique = true, length = 40)
    private String name;

    @Column(nullable = false, unique = true, length = 64)
    private String token = newToken();

    @Column(nullable = false)
    private boolean active = true;

    /** Invalida el QR anterior generando un token nuevo. */
    public void regenerateToken() {
        token = newToken();
    }

    private static String newToken() {
        return UUID.randomUUID().toString();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
