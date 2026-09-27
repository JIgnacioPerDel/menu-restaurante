package com.menurestaurante.mapper;

import com.menurestaurante.dto.OrderLineResponse;
import com.menurestaurante.dto.OrderResponse;
import com.menurestaurante.model.CustomerOrder;
import com.menurestaurante.model.OrderLine;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderResponse toResponse(CustomerOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getTable().getName(),
                order.getStatus(),
                order.getNotes(),
                order.getTotal(),
                order.getLines().stream().map(this::toResponse).toList(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    private OrderLineResponse toResponse(OrderLine line) {
        return new OrderLineResponse(
                line.getDishName(),
                line.getUnitPrice(),
                line.getQuantity(),
                line.getSubtotal(),
                line.getNotes()
        );
    }
}
