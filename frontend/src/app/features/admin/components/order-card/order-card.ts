import { Component, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ORDER_STATUS_LABELS, Order, OrderStatus, nextStatus } from '../../../../core/models/order';

/** Tarjeta de un pedido en el panel, con los botones para avanzarlo o cancelarlo. */
@Component({
  selector: 'app-order-card',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './order-card.html',
  styleUrl: './order-card.scss',
  host: {
    '[class.is-new]': 'isNew()',
    '(mouseenter)': 'seen.emit()',
  },
})
export class OrderCard {
  readonly order = input.required<Order>();
  readonly isNew = input(false);
  readonly busy = input(false);
  /** En curso muestra la antigüedad; en el historial, el estado final. */
  readonly showAge = input(true);

  readonly changeStatus = output<OrderStatus>();
  readonly seen = output<void>();

  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly nextStatus = nextStatus;

  protected minutesAgo(): number {
    return Math.max(0, Math.floor((Date.now() - new Date(this.order().createdAt).getTime()) / 60_000));
  }
}
