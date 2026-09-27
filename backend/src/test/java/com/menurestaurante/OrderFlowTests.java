package com.menurestaurante;

import com.menurestaurante.model.Category;
import com.menurestaurante.model.Dish;
import com.menurestaurante.model.RestaurantTable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderFlowTests extends IntegrationTest {

    private RestaurantTable table;
    private Dish croquetas;
    private Dish agua;
    private Dish agotado;

    @BeforeEach
    void setUp() {
        Category category = category("Test");
        croquetas = dish(category, "Croquetas", "9.50", true);
        agua = dish(category, "Agua", "2.00", true);
        agotado = dish(category, "Agotado", "5.00", false);
        table = table("Mesa T", true);
    }

    @Test
    void totalIsCalculatedOnTheServerIgnoringClientPrices() throws Exception {
        String body = json(Map.of("lines", List.of(
                Map.of("dishId", croquetas.getId(), "quantity", 2, "price", 0.01),
                Map.of("dishId", agua.getId(), "quantity", 3, "notes", "Del tiempo"))));

        mockMvc.perform(post("/api/public/tables/{token}/orders", table.getToken())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.tableName").value("Mesa T"))
                .andExpect(jsonPath("$.total").value(25.00))
                .andExpect(jsonPath("$.lines[1].notes").value("Del tiempo"));
    }

    @Test
    void unavailableDishCannotBeOrdered() throws Exception {
        mockMvc.perform(post("/api/public/tables/{token}/orders", table.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("lines", List.of(Map.of("dishId", agotado.getId(), "quantity", 1))))))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void invalidQuantityIsRejected() throws Exception {
        mockMvc.perform(post("/api/public/tables/{token}/orders", table.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("lines", List.of(Map.of("dishId", agua.getId(), "quantity", 0))))))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/public/tables/{token}/orders", table.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("lines", List.of()))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void inactiveOrUnknownTableCannotOrder() throws Exception {
        RestaurantTable inactive = table("Mesa cerrada", false);
        String body = json(Map.of("lines", List.of(Map.of("dishId", agua.getId(), "quantity", 1))));

        mockMvc.perform(post("/api/public/tables/{token}/orders", inactive.getToken())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
        mockMvc.perform(post("/api/public/tables/{token}/orders", "token-inventado")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void customerOnlySeesOrdersOfTheirOwnTable() throws Exception {
        long orderId = createOrder(table);
        RestaurantTable other = table("Mesa Otra", true);

        mockMvc.perform(get("/api/public/tables/{token}/orders", table.getToken()).param("ids", String.valueOf(orderId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        mockMvc.perform(get("/api/public/tables/{token}/orders", other.getToken()).param("ids", String.valueOf(orderId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void adminMovesOrderForwardButNotBackward() throws Exception {
        long orderId = createOrder(table);
        String auth = adminAuthorization();

        mockMvc.perform(get("/api/admin/orders").header("Authorization", auth))
                .andExpect(jsonPath("$[?(@.id == %d)]", orderId).exists());

        updateStatus(auth, orderId, "PREPARING").andExpect(status().isOk());
        updateStatus(auth, orderId, "PENDING").andExpect(status().isConflict());
        updateStatus(auth, orderId, "SERVED").andExpect(status().isOk());
        updateStatus(auth, orderId, "CANCELLED").andExpect(status().isConflict());

        mockMvc.perform(get("/api/admin/orders").param("scope", "history").header("Authorization", auth))
                .andExpect(jsonPath("$[?(@.id == %d)].status", orderId).value("SERVED"));
    }

    @Test
    void regeneratingTokenInvalidatesOldQr() throws Exception {
        String oldToken = table.getToken();
        mockMvc.perform(post("/api/admin/tables/{id}/regenerate-token", table.getId())
                        .header("Authorization", adminAuthorization()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/public/tables/{token}", oldToken)).andExpect(status().isNotFound());
    }

    @Test
    void qrCodeIsPng() throws Exception {
        mockMvc.perform(get("/api/admin/tables/{id}/qr", table.getId()).header("Authorization", adminAuthorization()))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    byte[] png = result.getResponse().getContentAsByteArray();
                    if (png.length < 8 || png[1] != 'P' || png[2] != 'N' || png[3] != 'G') {
                        throw new AssertionError("La respuesta no es un PNG");
                    }
                });
    }

    private long createOrder(RestaurantTable target) throws Exception {
        String response = mockMvc.perform(post("/api/public/tables/{token}/orders", target.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("lines", List.of(Map.of("dishId", agua.getId(), "quantity", 1))))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return readJson(response).get("id").asLong();
    }

    private org.springframework.test.web.servlet.ResultActions updateStatus(String auth, long id, String status)
            throws Exception {
        return mockMvc.perform(patch("/api/admin/orders/{id}/status", id)
                .header("Authorization", auth)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("status", status))));
    }
}
