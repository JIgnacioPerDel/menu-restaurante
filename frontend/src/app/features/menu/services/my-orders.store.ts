import { Injectable } from '@angular/core';

const MAX_TRACKED = 20;

/**
 * Recuerda los pedidos hechos desde este dispositivo en cada mesa. El backend solo devuelve
 * pedidos de la mesa cuyo token se envía, así que un cliente no puede ver los de otra.
 */
@Injectable({ providedIn: 'root' })
export class MyOrdersStore {
  getIds(tableToken: string): number[] {
    try {
      const raw = localStorage.getItem(this.key(tableToken));
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  }

  add(tableToken: string, orderId: number): void {
    const ids = [orderId, ...this.getIds(tableToken).filter((id) => id !== orderId)].slice(0, MAX_TRACKED);
    try {
      localStorage.setItem(this.key(tableToken), JSON.stringify(ids));
    } catch {
      // Sin almacenamiento solo se verá el último pedido mientras dure la pestaña
    }
  }

  private key(tableToken: string): string {
    return `menu.orders.${tableToken}`;
  }
}
