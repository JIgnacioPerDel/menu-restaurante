package com.menurestaurante.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OrderStatusTest {

    @Test
    void onlyMovesForward() {
        assertThat(OrderStatus.PENDING.canTransitionTo(OrderStatus.PREPARING)).isTrue();
        assertThat(OrderStatus.PENDING.canTransitionTo(OrderStatus.SERVED)).isTrue();
        assertThat(OrderStatus.READY.canTransitionTo(OrderStatus.PREPARING)).isFalse();
        assertThat(OrderStatus.PREPARING.canTransitionTo(OrderStatus.PREPARING)).isFalse();
    }

    @Test
    void canBeCancelledUntilServed() {
        assertThat(OrderStatus.READY.canTransitionTo(OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatus.SERVED.canTransitionTo(OrderStatus.CANCELLED)).isFalse();
        assertThat(OrderStatus.CANCELLED.canTransitionTo(OrderStatus.PENDING)).isFalse();
    }
}
