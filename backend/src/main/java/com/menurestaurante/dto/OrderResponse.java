package com.menurestaurante.dto;

import com.menurestaurante.model.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String tableName,
        OrderStatus status,
        String notes,
        BigDecimal total,
        List<OrderLineResponse> lines,
        Instant createdAt,
        Instant updatedAt
) {
}
