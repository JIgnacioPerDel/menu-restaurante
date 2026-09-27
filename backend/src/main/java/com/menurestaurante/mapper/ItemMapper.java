package com.menurestaurante.mapper;

import com.menurestaurante.dto.ItemRequest;
import com.menurestaurante.dto.ItemResponse;
import com.menurestaurante.model.Item;
import org.springframework.stereotype.Component;

@Component
public class ItemMapper {

    public ItemResponse toResponse(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    public void updateEntity(Item item, ItemRequest request) {
        item.setName(request.name());
        item.setDescription(request.description());
    }
}
