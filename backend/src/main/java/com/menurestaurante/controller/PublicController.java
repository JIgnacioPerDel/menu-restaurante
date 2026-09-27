package com.menurestaurante.controller;

import com.menurestaurante.dto.CreateOrderRequest;
import com.menurestaurante.dto.MenuCategoryResponse;
import com.menurestaurante.dto.OrderResponse;
import com.menurestaurante.dto.PublicTableResponse;
import com.menurestaurante.service.MenuService;
import com.menurestaurante.service.OrderService;
import com.menurestaurante.service.TableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API pública: la carta y los pedidos de los clientes. Para pedir hace falta el token de la mesa (QR).
 */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final MenuService menuService;
    private final TableService tableService;
    private final OrderService orderService;

    public PublicController(MenuService menuService, TableService tableService, OrderService orderService) {
        this.menuService = menuService;
        this.tableService = tableService;
        this.orderService = orderService;
    }

    @GetMapping("/menu")
    public List<MenuCategoryResponse> menu() {
        return menuService.getPublicMenu();
    }

    @GetMapping("/tables/{token}")
    public PublicTableResponse table(@PathVariable String token) {
        return tableService.findByToken(token);
    }

    @PostMapping("/tables/{token}/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@PathVariable String token, @Valid @RequestBody CreateOrderRequest request) {
        return orderService.create(token, request);
    }

    @GetMapping("/tables/{token}/orders")
    public List<OrderResponse> myOrders(@PathVariable String token, @RequestParam List<Long> ids) {
        return orderService.findForTable(token, ids);
    }
}
