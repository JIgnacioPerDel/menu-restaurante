package com.menurestaurante.service;

import com.menurestaurante.dto.ItemRequest;
import com.menurestaurante.dto.ItemResponse;
import com.menurestaurante.exception.ResourceNotFoundException;
import com.menurestaurante.mapper.ItemMapper;
import com.menurestaurante.model.Item;
import com.menurestaurante.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;

    public ItemService(ItemRepository itemRepository, ItemMapper itemMapper) {
        this.itemRepository = itemRepository;
        this.itemMapper = itemMapper;
    }

    public List<ItemResponse> findAll() {
        return itemRepository.findAll().stream().map(itemMapper::toResponse).toList();
    }

    public ItemResponse findById(Long id) {
        return itemMapper.toResponse(getItem(id));
    }

    @Transactional
    public ItemResponse create(ItemRequest request) {
        Item item = new Item();
        itemMapper.updateEntity(item, request);
        return itemMapper.toResponse(itemRepository.save(item));
    }

    @Transactional
    public ItemResponse update(Long id, ItemRequest request) {
        Item item = getItem(id);
        itemMapper.updateEntity(item, request);
        return itemMapper.toResponse(itemRepository.saveAndFlush(item));
    }

    @Transactional
    public void delete(Long id) {
        itemRepository.delete(getItem(id));
    }

    private Item getItem(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", id));
    }
}
