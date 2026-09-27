package com.menurestaurante.mapper;

import com.menurestaurante.config.AppProperties;
import com.menurestaurante.dto.PublicTableResponse;
import com.menurestaurante.dto.TableResponse;
import com.menurestaurante.model.RestaurantTable;
import org.springframework.stereotype.Component;

@Component
public class TableMapper {

    private final AppProperties properties;

    public TableMapper(AppProperties properties) {
        this.properties = properties;
    }

    public TableResponse toResponse(RestaurantTable table) {
        return new TableResponse(table.getId(), table.getName(), table.isActive(), table.getToken(), orderUrl(table));
    }

    public PublicTableResponse toPublicResponse(RestaurantTable table) {
        return new PublicTableResponse(table.getName(), table.isActive());
    }

    /** URL que abre el cliente al escanear el QR de la mesa. */
    public String orderUrl(RestaurantTable table) {
        return properties.publicUrl().replaceAll("/+$", "") + "/mesa/" + table.getToken();
    }
}
