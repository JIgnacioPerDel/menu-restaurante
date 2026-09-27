package com.menurestaurante.dto;

import com.menurestaurante.model.Allergen;

import java.math.BigDecimal;
import java.util.List;

public record DishResponse(
        Long id,
        Long categoryId,
        String name,
        String description,
        BigDecimal price,
        boolean available,
        List<Allergen> allergens
) {
}
