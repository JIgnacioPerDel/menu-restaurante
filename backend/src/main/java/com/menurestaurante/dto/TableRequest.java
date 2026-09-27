package com.menurestaurante.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TableRequest(
        @NotBlank @Size(max = 40) String name,
        boolean active
) {
}
