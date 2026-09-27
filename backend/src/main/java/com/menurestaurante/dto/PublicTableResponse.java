package com.menurestaurante.dto;

/** Mesa vista por el cliente: solo lo necesario para mostrarla. */
public record PublicTableResponse(String name, boolean active) {
}
