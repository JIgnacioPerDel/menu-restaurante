package com.menurestaurante.dto;

import java.math.BigDecimal;

public record OrderLineResponse(
        String dishName,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal subtotal,
        String notes
) {
}
