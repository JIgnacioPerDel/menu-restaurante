package com.menurestaurante.service;

import com.menurestaurante.dto.CreateOrderRequest;
import com.menurestaurante.dto.OrderLineRequest;
import com.menurestaurante.dto.OrderResponse;
import com.menurestaurante.exception.BusinessException;
import com.menurestaurante.exception.ResourceNotFoundException;
import com.menurestaurante.mapper.OrderMapper;
import com.menurestaurante.model.CustomerOrder;
import com.menurestaurante.model.Dish;
import com.menurestaurante.model.OrderLine;
import com.menurestaurante.model.OrderStatus;
import com.menurestaurante.repository.DishRepository;
import com.menurestaurante.repository.OrderRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class OrderService {

    private static final Set<OrderStatus> ACTIVE = EnumSet.of(OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY);
    private static final Set<OrderStatus> FINISHED = EnumSet.of(OrderStatus.SERVED, OrderStatus.CANCELLED);
    private static final int HISTORY_LIMIT = 100;
    private static final int MAX_TRACKED_ORDERS = 20;

    private final OrderRepository orderRepository;
    private final DishRepository dishRepository;
    private final TableService tableService;
    private final OrderMapper mapper;

    public OrderService(OrderRepository orderRepository, DishRepository dishRepository,
                        TableService tableService, OrderMapper mapper) {
        this.orderRepository = orderRepository;
        this.dishRepository = dishRepository;
        this.tableService = tableService;
        this.mapper = mapper;
    }

    /** Pedido del cliente. Precios y total se calculan aquí a partir de la carta, nunca del cliente. */
    @Transactional
    public OrderResponse create(String tableToken, CreateOrderRequest request) {
        CustomerOrder order = new CustomerOrder();
        order.setTable(tableService.getActiveByToken(tableToken));
        order.setNotes(blankToNull(request.notes()));

        Set<Long> dishIds = request.lines().stream().map(OrderLineRequest::dishId).collect(Collectors.toSet());
        Map<Long, Dish> dishes = dishRepository.findAllByIdIn(dishIds).stream()
                .collect(Collectors.toMap(Dish::getId, Function.identity()));

        for (OrderLineRequest line : request.lines()) {
            Dish dish = dishes.get(line.dishId());
            if (dish == null || !dish.isAvailable()) {
                throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Uno de los platos ya no está disponible. Revisa tu pedido.");
            }
            order.addLine(new OrderLine(dish, line.quantity(), blankToNull(line.notes())));
        }
        return mapper.toResponse(orderRepository.save(order));
    }

    /** Pedidos que el cliente ha hecho desde su dispositivo; solo devuelve los de esa mesa. */
    public List<OrderResponse> findForTable(String tableToken, Collection<Long> ids) {
        if (ids.isEmpty()) {
            return List.of();
        }
        if (ids.size() > MAX_TRACKED_ORDERS) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Demasiados pedidos solicitados");
        }
        return orderRepository.findByTableTokenAndIdInOrderByCreatedAtDesc(tableToken, ids).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<OrderResponse> findActive() {
        return orderRepository.findByStatusInOrderByCreatedAtAsc(ACTIVE).stream().map(mapper::toResponse).toList();
    }

    public List<OrderResponse> findHistory() {
        return orderRepository.findByStatusInOrderByCreatedAtDesc(FINISHED, PageRequest.of(0, HISTORY_LIMIT)).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus target) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));
        if (!order.getStatus().canTransitionTo(target)) {
            throw new BusinessException("No se puede pasar un pedido de " + order.getStatus() + " a " + target);
        }
        order.setStatus(target);
        return mapper.toResponse(orderRepository.saveAndFlush(order));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
