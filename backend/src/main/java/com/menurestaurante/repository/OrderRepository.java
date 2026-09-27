package com.menurestaurante.repository;

import com.menurestaurante.model.CustomerOrder;
import com.menurestaurante.model.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    @EntityGraph(attributePaths = {"table", "lines"})
    List<CustomerOrder> findByStatusInOrderByCreatedAtAsc(Collection<OrderStatus> statuses);

    @EntityGraph(attributePaths = {"table", "lines"})
    List<CustomerOrder> findByStatusInOrderByCreatedAtDesc(Collection<OrderStatus> statuses, Pageable pageable);

    @EntityGraph(attributePaths = {"table", "lines"})
    List<CustomerOrder> findByTableTokenAndIdInOrderByCreatedAtDesc(String token, Collection<Long> ids);
}
