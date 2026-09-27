package com.menurestaurante.service;

import com.menurestaurante.dto.PublicTableResponse;
import com.menurestaurante.dto.TableRequest;
import com.menurestaurante.dto.TableResponse;
import com.menurestaurante.exception.BusinessException;
import com.menurestaurante.exception.ResourceNotFoundException;
import com.menurestaurante.mapper.TableMapper;
import com.menurestaurante.model.RestaurantTable;
import com.menurestaurante.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TableService {

    private final RestaurantTableRepository tableRepository;
    private final TableMapper mapper;
    private final QrCodeService qrCodeService;

    public TableService(RestaurantTableRepository tableRepository, TableMapper mapper, QrCodeService qrCodeService) {
        this.tableRepository = tableRepository;
        this.mapper = mapper;
        this.qrCodeService = qrCodeService;
    }

    public PublicTableResponse findByToken(String token) {
        return mapper.toPublicResponse(getByToken(token));
    }

    /** Mesa a la que se puede pedir: existe y está activa. */
    public RestaurantTable getActiveByToken(String token) {
        RestaurantTable table = getByToken(token);
        if (!table.isActive()) {
            throw new BusinessException("Esta mesa no admite pedidos ahora mismo. Avisa al personal.");
        }
        return table;
    }

    public List<TableResponse> findAll() {
        return tableRepository.findAllByOrderByNameAsc().stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public TableResponse create(TableRequest request) {
        if (tableRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new BusinessException("Ya existe una mesa con ese nombre");
        }
        RestaurantTable table = new RestaurantTable();
        apply(table, request);
        return mapper.toResponse(tableRepository.save(table));
    }

    @Transactional
    public TableResponse update(Long id, TableRequest request) {
        RestaurantTable table = getById(id);
        if (tableRepository.existsByNameIgnoreCaseAndIdNot(request.name().trim(), id)) {
            throw new BusinessException("Ya existe una mesa con ese nombre");
        }
        apply(table, request);
        return mapper.toResponse(tableRepository.saveAndFlush(table));
    }

    @Transactional
    public TableResponse regenerateToken(Long id) {
        RestaurantTable table = getById(id);
        table.regenerateToken();
        return mapper.toResponse(tableRepository.saveAndFlush(table));
    }

    public byte[] qrCode(Long id) {
        return qrCodeService.generatePng(mapper.orderUrl(getById(id)));
    }

    private void apply(RestaurantTable table, TableRequest request) {
        table.setName(request.name().trim());
        table.setActive(request.active());
    }

    private RestaurantTable getById(Long id) {
        return tableRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Mesa", id));
    }

    private RestaurantTable getByToken(String token) {
        return tableRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada. Escanea de nuevo el código QR."));
    }
}
