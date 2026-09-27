package com.menurestaurante.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** El cliente solo indica plato y cantidad: el precio lo pone siempre el servidor. */
public record OrderLineRequest(
        @NotNull Long dishId,
        @Min(1) @Max(50) int quantity,
        @Size(max = 200) String notes
) {
}
