package com.menurestaurante.repository;

import com.menurestaurante.model.Dish;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface DishRepository extends JpaRepository<Dish, Long> {

    @EntityGraph(attributePaths = "category")
    List<Dish> findAllByOrderByNameAsc();

    List<Dish> findByAvailableTrueOrderByNameAsc();

    List<Dish> findAllByIdIn(Collection<Long> ids);

    boolean existsByCategoryId(Long categoryId);
}
