package com.menurestaurante;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Los clientes no deben poder acceder al panel de administración. */
class SecurityTests extends IntegrationTest {

    @Test
    void publicMenuIsOpen() throws Exception {
        mockMvc.perform(get("/api/public/menu")).andExpect(status().isOk());
    }

    @Test
    void adminEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/admin/orders")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/tables")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/admin/dishes").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(patch("/api/admin/orders/1/status").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"SERVED\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void forgedTokenIsRejected() throws Exception {
        String forged = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl19.firma-falsa";
        mockMvc.perform(get("/api/admin/orders").header("Authorization", forged))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithWrongPasswordFails() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", "admin", "password", "incorrecta"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Usuario o contraseña incorrectos"));
    }

    @Test
    void adminCanAccessPanelWithToken() throws Exception {
        mockMvc.perform(get("/api/admin/orders").header("Authorization", adminAuthorization()))
                .andExpect(status().isOk());
    }

    @Test
    void unknownEndpointsAreDenied() throws Exception {
        mockMvc.perform(get("/api/otra-cosa")).andExpect(status().isUnauthorized());
    }
}
