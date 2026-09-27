package com.menurestaurante.dto;

import java.util.List;

/** Categoría de la carta pública con sus platos disponibles. */
public record MenuCategoryResponse(Long id, String name, List<DishResponse> dishes) {
}
