package com.menurestaurante.model;

/**
 * Estados de un pedido, en el orden en que avanza. SERVED y CANCELLED son finales.
 */
public enum OrderStatus {
    PENDING,
    PREPARING,
    READY,
    SERVED,
    CANCELLED;

    public boolean isFinal() {
        return this == SERVED || this == CANCELLED;
    }

    /** Solo se avanza hacia delante; se puede cancelar mientras el pedido no sea final. */
    public boolean canTransitionTo(OrderStatus target) {
        if (isFinal()) {
            return false;
        }
        return target == CANCELLED || target.ordinal() > ordinal();
    }
}
