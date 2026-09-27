import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, merge, switchMap, timer } from 'rxjs';
import { ApiError } from '../../../../core/models/api-error';
import { ORDER_STATUS_LABELS, Order, OrderStatus } from '../../../../core/models/order';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { OrderCard } from '../../components/order-card/order-card';
import { AdminApiService } from '../../services/admin-api.service';

const REFRESH_MS = 5_000;
const COLUMNS: OrderStatus[] = ['PENDING', 'PREPARING', 'READY'];

/** Vista de pedidos del local (RF-13, RF-14, RF-15). Se refresca sola cada pocos segundos. */
@Component({
  selector: 'app-orders-page',
  imports: [DatePipe, ErrorMessage, OrderCard],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.scss',
})
export class OrdersPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh$ = new Subject<void>();

  protected readonly scope = signal<'active' | 'history'>('active');
  protected readonly orders = signal<Order[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly updating = signal<number | null>(null);
  protected readonly lastUpdate = signal<Date | null>(null);
  /** Pedidos que han llegado desde la última vez que se miró la pantalla. */
  protected readonly newIds = signal<Set<number>>(new Set());
  private knownIds: Set<number> | null = null;

  protected readonly columns = COLUMNS;
  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly byStatus = computed(() => {
    const groups = new Map<OrderStatus, Order[]>(COLUMNS.map((status) => [status, []]));
    for (const order of this.orders()) {
      groups.get(order.status)?.push(order);
    }
    return groups;
  });
  protected readonly pendingCount = computed(() => this.byStatus().get('PENDING')?.length ?? 0);

  ngOnInit(): void {
    merge(timer(0, REFRESH_MS), this.refresh$)
      .pipe(
        switchMap(() => this.api.getOrders(this.scope())),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (orders) => this.onOrders(orders),
        error: (err: ApiError) => this.error.set(err.message),
      });
    this.destroyRef.onDestroy(() => this.title.setTitle('Pedidos'));
  }

  protected setScope(scope: 'active' | 'history'): void {
    this.scope.set(scope);
    this.orders.set([]);
    this.refresh$.next();
  }

  protected advance(order: Order, status: OrderStatus): void {
    if (status === 'CANCELLED' && !confirm(`¿Cancelar el pedido #${order.id} de ${order.tableName}?`)) {
      return;
    }
    this.updating.set(order.id);
    this.api.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        this.updating.set(null);
        this.markSeen(order.id);
        this.refresh$.next();
      },
      error: (err: ApiError) => {
        this.updating.set(null);
        this.error.set(err.message);
        this.refresh$.next();
      },
    });
  }

  protected markSeen(id: number): void {
    this.newIds.update((ids) => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
  }

  private onOrders(orders: Order[]): void {
    this.error.set(null);
    this.lastUpdate.set(new Date());
    this.orders.set(orders);

    if (this.scope() === 'active') {
      // La primera carga no cuenta como "nuevos"; a partir de ahí se resaltan los que lleguen
      if (this.knownIds) {
        const arrived = orders.filter((order) => !this.knownIds!.has(order.id)).map((order) => order.id);
        if (arrived.length) {
          this.newIds.update((ids) => new Set([...ids, ...arrived]));
        }
      }
      this.knownIds = new Set([...(this.knownIds ?? []), ...orders.map((order) => order.id)]);
      const pending = this.pendingCount();
      this.title.setTitle(pending ? `(${pending}) Pedidos` : 'Pedidos');
    }
  }
}
