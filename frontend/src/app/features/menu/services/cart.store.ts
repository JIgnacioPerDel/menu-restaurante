import { Injectable, computed, signal } from '@angular/core';
import { Dish } from '../../../core/models/menu';

export interface CartLine {
  dish: Dish;
  quantity: number;
  notes: string;
}

const MAX_QUANTITY = 50;

/**
 * Carrito de una mesa. Se guarda en el dispositivo para no perderlo si el cliente recarga (RF-07).
 * Se provee por componente: cada página de mesa tiene el suyo.
 */
@Injectable()
export class CartStore {
  private storageKey: string | null = null;
  private readonly _lines = signal<CartLine[]>([]);

  readonly lines = this._lines.asReadonly();
  readonly count = computed(() => this._lines().reduce((sum, line) => sum + line.quantity, 0));
  readonly total = computed(() =>
    this._lines().reduce((sum, line) => sum + line.dish.price * line.quantity, 0),
  );

  /** Carga el carrito guardado de la mesa y lo cuadra con la carta actual (precios y disponibilidad). */
  init(tableToken: string, menuDishes: Dish[]): void {
    this.storageKey = `menu.cart.${tableToken}`;
    const current = new Map(menuDishes.map((dish) => [dish.id, dish]));
    const saved = this.read();
    this._lines.set(
      saved
        .filter((line) => current.has(line.dish.id))
        .map((line) => ({ ...line, dish: current.get(line.dish.id)! })),
    );
    this.persist();
  }

  quantityOf(dishId: number): number {
    return this._lines().find((line) => line.dish.id === dishId)?.quantity ?? 0;
  }

  add(dish: Dish): void {
    const existing = this._lines().find((line) => line.dish.id === dish.id);
    if (existing) {
      this.setQuantity(dish.id, existing.quantity + 1);
    } else {
      this.update([...this._lines(), { dish, quantity: 1, notes: '' }]);
    }
  }

  setQuantity(dishId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(dishId);
      return;
    }
    const capped = Math.min(quantity, MAX_QUANTITY);
    this.update(this._lines().map((line) => (line.dish.id === dishId ? { ...line, quantity: capped } : line)));
  }

  setNotes(dishId: number, notes: string): void {
    this.update(this._lines().map((line) => (line.dish.id === dishId ? { ...line, notes } : line)));
  }

  remove(dishId: number): void {
    this.update(this._lines().filter((line) => line.dish.id !== dishId));
  }

  clear(): void {
    this.update([]);
  }

  private update(lines: CartLine[]): void {
    this._lines.set(lines);
    this.persist();
  }

  private read(): CartLine[] {
    if (!this.storageKey) {
      return [];
    }
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (!this.storageKey) {
      return;
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this._lines()));
    } catch {
      // Sin almacenamiento el carrito dura lo que la pestaña
    }
  }
}
