package com.menurestaurante.controller;

import com.menurestaurante.dto.OrderResponse;
import com.menurestaurante.dto.UpdateOrderStatusRequest;
import com.menurestaurante.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** {@code scope=active}: pedidos en curso (más antiguos primero). {@code scope=history}: servidos y cancelados. */
    @GetMapping
    public List<OrderResponse> findAll(@RequestParam(defaultValue = "active") String scope) {
        return "history".equals(scope) ? orderService.findHistory() : orderService.findActive();
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request.status());
    }
}
