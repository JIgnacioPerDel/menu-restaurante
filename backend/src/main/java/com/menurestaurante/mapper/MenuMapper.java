package com.menurestaurante.mapper;

import com.menurestaurante.dto.CategoryResponse;
import com.menurestaurante.dto.DishResponse;
import com.menurestaurante.model.Category;
import com.menurestaurante.model.Dish;
import org.springframework.stereotype.Component;

@Component
public class MenuMapper {

    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getPosition());
    }

    public DishResponse toResponse(Dish dish) {
        return new DishResponse(
                dish.getId(),
                dish.getCategory().getId(),
                dish.getName(),
                dish.getDescription(),
                dish.getPrice(),
                dish.isAvailable(),
                dish.getAllergens().stream().sorted().toList()
        );
    }
}
