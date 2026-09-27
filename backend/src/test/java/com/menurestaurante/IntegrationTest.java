package com.menurestaurante;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.menurestaurante.model.Category;
import com.menurestaurante.model.Dish;
import com.menurestaurante.model.RestaurantTable;
import com.menurestaurante.repository.CategoryRepository;
import com.menurestaurante.repository.DishRepository;
import com.menurestaurante.repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Base de los tests de integración: contexto completo, H2 y rollback tras cada test. */
@SpringBootTest(properties = "app.demo-data=false")
@AutoConfigureMockMvc
@Transactional
public abstract class IntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected CategoryRepository categoryRepository;

    @Autowired
    protected DishRepository dishRepository;

    @Autowired
    protected RestaurantTableRepository tableRepository;

    protected Category category(String name) {
        Category category = new Category();
        category.setName(name);
        category.setPosition(1);
        return categoryRepository.save(category);
    }

    protected Dish dish(Category category, String name, String price, boolean available) {
        Dish dish = new Dish();
        dish.setCategory(category);
        dish.setName(name);
        dish.setPrice(new BigDecimal(price));
        dish.setAvailable(available);
        return dishRepository.save(dish);
    }

    protected RestaurantTable table(String name, boolean active) {
        RestaurantTable table = new RestaurantTable();
        table.setName(name);
        table.setActive(active);
        return tableRepository.save(table);
    }

    /** Inicia sesión con el administrador de desarrollo y devuelve la cabecera Authorization. */
    protected String adminAuthorization() throws Exception {
        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", "admin", "password", "admin"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + objectMapper.readTree(body).get("token").asText();
    }

    protected String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }

    protected JsonNode readJson(String body) throws Exception {
        return objectMapper.readTree(body);
    }
}
