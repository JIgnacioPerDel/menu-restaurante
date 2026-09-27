import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, forkJoin, switchMap, timer } from 'rxjs';
import { ApiError } from '../../../../core/models/api-error';
import { Dish, MenuCategory } from '../../../../core/models/menu';
import { ORDER_STATUS_LABELS, Order } from '../../../../core/models/order';
import { PublicTable } from '../../../../core/models/table';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { CartPanel } from '../../components/cart-panel/cart-panel';
import { MenuView } from '../../components/menu-view/menu-view';
import { CartStore } from '../../services/cart.store';
import { MyOrdersStore } from '../../services/my-orders.store';
import { PublicApiService } from '../../services/public-api.service';

const ORDERS_REFRESH_MS = 10_000;

/** Página que abre el QR de la mesa: carta + carrito + seguimiento de pedidos. */
@Component({
  selector: 'app-table-page',
  imports: [MenuView, CartPanel, ErrorMessage, CurrencyPipe, DatePipe],
  providers: [CartStore],
  templateUrl: './table-page.html',
  styleUrl: './table-page.scss',
})
export class TablePage implements OnInit {
  private readonly api = inject(PublicApiService);
  private readonly myOrders = inject(MyOrdersStore);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly cart = inject(CartStore);

  /** Token de la mesa, viene de la ruta /mesa/:token */
  readonly token = input.required<string>();

  protected readonly table = signal<PublicTable | null>(null);
  protected readonly menu = signal<MenuCategory[]>([]);
  protected readonly orders = signal<Order[]>([]);
  protected readonly state = signal<'loading' | 'ready' | 'not-found'>('loading');
  protected readonly error = signal<string | null>(null);
  protected readonly cartOpen = signal(false);
  protected readonly sending = signal(false);
  protected readonly notes = signal('');
  protected readonly justSent = signal<Order | null>(null);
  private readonly orderIds = signal<number[]>([]);

  protected readonly canOrder = computed(() => this.table()?.active ?? false);
  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly quantityOf = (dishId: number) => this.cart.quantityOf(dishId);

  ngOnInit(): void {
    this.orderIds.set(this.myOrders.getIds(this.token()));

    forkJoin({ table: this.api.getTable(this.token()), menu: this.api.getMenu() }).subscribe({
      next: ({ table, menu }) => {
        this.table.set(table);
        this.setMenu(menu);
        this.state.set('ready');
        this.pollOrders();
      },
      error: (err: ApiError) => {
        if (err.status === 404) {
          this.state.set('not-found');
        } else {
          this.error.set(err.message);
          this.state.set('ready');
        }
      },
    });
  }

  protected decrease(dish: Dish): void {
    this.cart.setQuantity(dish.id, this.cart.quantityOf(dish.id) - 1);
  }

  protected sendOrder(): void {
    if (!this.cart.lines().length || this.sending()) {
      return;
    }
    this.sending.set(true);
    this.error.set(null);

    const request = {
      lines: this.cart.lines().map((line) => ({
        dishId: line.dish.id,
        quantity: line.quantity,
        notes: line.notes.trim() || null,
      })),
      notes: this.notes().trim() || null,
    };

    this.api.createOrder(this.token(), request).subscribe({
      next: (order) => {
        this.myOrders.add(this.token(), order.id);
        this.orderIds.set(this.myOrders.getIds(this.token()));
        this.orders.update((orders) => [order, ...orders]);
        this.cart.clear();
        this.notes.set('');
        this.cartOpen.set(false);
        this.sending.set(false);
        this.justSent.set(order);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err: ApiError) => {
        this.sending.set(false);
        this.error.set(err.message);
        this.cartOpen.set(false);
        // Si un plato se ha agotado mientras tanto, recargamos la carta y el carrito se ajusta solo
        if (err.status === 422) {
          this.api.getMenu().subscribe((menu) => this.setMenu(menu));
        }
      },
    });
  }

  private setMenu(menu: MenuCategory[]): void {
    this.menu.set(menu);
    this.cart.init(this.token(), menu.flatMap((category) => category.dishes));
  }

  /** Actualiza el estado de los pedidos de este dispositivo cada pocos segundos (RF-09). */
  private pollOrders(): void {
    timer(0, ORDERS_REFRESH_MS)
      .pipe(
        switchMap(() => {
          const ids = this.orderIds();
          return ids.length ? this.api.getOrders(this.token(), ids) : EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({ next: (orders) => this.orders.set(orders), error: () => undefined });
  }
}
