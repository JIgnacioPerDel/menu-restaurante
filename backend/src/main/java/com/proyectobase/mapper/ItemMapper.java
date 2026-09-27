package com.proyectobase.mapper;

import com.proyectobase.dto.ItemRequest;
import com.proyectobase.dto.ItemResponse;
import com.proyectobase.model.Item;
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
