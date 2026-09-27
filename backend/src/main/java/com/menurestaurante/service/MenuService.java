package com.menurestaurante.service;

import com.menurestaurante.dto.CategoryRequest;
import com.menurestaurante.dto.CategoryResponse;
import com.menurestaurante.dto.DishRequest;
import com.menurestaurante.dto.DishResponse;
import com.menurestaurante.dto.MenuCategoryResponse;
import com.menurestaurante.exception.BusinessException;
import com.menurestaurante.exception.ResourceNotFoundException;
import com.menurestaurante.mapper.MenuMapper;
import com.menurestaurante.model.Category;
import com.menurestaurante.model.Dish;
import com.menurestaurante.repository.CategoryRepository;
import com.menurestaurante.repository.DishRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MenuService {

    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final MenuMapper mapper;

    public MenuService(CategoryRepository categoryRepository, DishRepository dishRepository, MenuMapper mapper) {
        this.categoryRepository = categoryRepository;
        this.dishRepository = dishRepository;
        this.mapper = mapper;
    }

    /** Carta pública: solo platos disponibles y solo categorías con algún plato. */
    public List<MenuCategoryResponse> getPublicMenu() {
        Map<Long, List<DishResponse>> dishesByCategory = dishRepository.findByAvailableTrueOrderByNameAsc().stream()
                .map(mapper::toResponse)
                .collect(Collectors.groupingBy(DishResponse::categoryId));
        return categoryRepository.findAllByOrderByPositionAscNameAsc().stream()
                .filter(category -> dishesByCategory.containsKey(category.getId()))
                .map(category -> new MenuCategoryResponse(
                        category.getId(), category.getName(), dishesByCategory.get(category.getId())))
                .toList();
    }

    // ---------- Categorías ----------

    public List<CategoryResponse> findAllCategories() {
        return categoryRepository.findAllByOrderByPositionAscNameAsc().stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new BusinessException("Ya existe una categoría con ese nombre");
        }
        Category category = new Category();
        apply(category, request);
        return mapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = getCategory(id);
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.name().trim(), id)) {
            throw new BusinessException("Ya existe una categoría con ese nombre");
        }
        apply(category, request);
        return mapper.toResponse(categoryRepository.saveAndFlush(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategory(id);
        if (dishRepository.existsByCategoryId(id)) {
            throw new BusinessException("No se puede eliminar una categoría que tiene platos");
        }
        categoryRepository.delete(category);
    }

    // ---------- Platos ----------

    public List<DishResponse> findAllDishes() {
        return dishRepository.findAllByOrderByNameAsc().stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public DishResponse createDish(DishRequest request) {
        Dish dish = new Dish();
        apply(dish, request);
        return mapper.toResponse(dishRepository.save(dish));
    }

    @Transactional
    public DishResponse updateDish(Long id, DishRequest request) {
        Dish dish = getDish(id);
        apply(dish, request);
        return mapper.toResponse(dishRepository.saveAndFlush(dish));
    }

    @Transactional
    public void deleteDish(Long id) {
        dishRepository.delete(getDish(id));
    }

    private void apply(Category category, CategoryRequest request) {
        category.setName(request.name().trim());
        category.setPosition(request.position());
    }

    private void apply(Dish dish, DishRequest request) {
        dish.setCategory(getCategory(request.categoryId()));
        dish.setName(request.name().trim());
        dish.setDescription(request.description());
        dish.setPrice(request.price());
        dish.setAvailable(request.available());
        dish.setAllergens(request.allergens() == null ? Set.of() : request.allergens());
    }

    private Category getCategory(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Categoría", id));
    }

    private Dish getDish(Long id) {
        return dishRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Plato", id));
    }
}
