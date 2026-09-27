package com.menurestaurante.dto;

/** Mesa vista por el administrador: incluye el token y la URL que codifica el QR. */
public record TableResponse(Long id, String name, boolean active, String token, String orderUrl) {
}
