package com.menurestaurante;

import com.menurestaurante.model.Category;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MenuTests extends IntegrationTest {

    @Test
    void publicMenuHidesUnavailableDishesAndEmptyCategories() throws Exception {
        Category starters = category("Entrantes");
        category("Vacía");
        dish(starters, "Bravas", "6.00", true);
        dish(starters, "Agotado", "5.00", false);

        mockMvc.perform(get("/api/public/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Entrantes"))
                .andExpect(jsonPath("$[0].dishes.length()").value(1))
                .andExpect(jsonPath("$[0].dishes[0].name").value("Bravas"));
    }

    @Test
    void adminCreatesDishWithAllergens() throws Exception {
        Category category = category("Postres");
        mockMvc.perform(post("/api/admin/dishes")
                        .header("Authorization", adminAuthorization())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "categoryId", category.getId(),
                                "name", "Tarta de queso",
                                "price", 6.5,
                                "available", true,
                                "allergens", new String[]{"MILK", "EGGS"}))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.allergens.length()").value(2));
    }

    @Test
    void categoryWithDishesCannotBeDeleted() throws Exception {
        Category category = category("Principales");
        dish(category, "Solomillo", "22.00", true);

        mockMvc.perform(delete("/api/admin/categories/{id}", category.getId())
                        .header("Authorization", adminAuthorization()))
                .andExpect(status().isConflict());
    }
}
