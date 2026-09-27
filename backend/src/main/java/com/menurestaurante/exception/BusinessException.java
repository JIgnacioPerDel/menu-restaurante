package com.menurestaurante.exception;

import org.springframework.http.HttpStatus;

/** Regla de negocio incumplida. Por defecto responde 409 Conflict. */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(String message) {
        this(HttpStatus.CONFLICT, message);
    }

    public BusinessException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
