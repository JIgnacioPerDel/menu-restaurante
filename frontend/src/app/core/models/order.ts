export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export interface OrderLine {
  dishName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  notes: string | null;
}

export interface Order {
  id: number;
  tableName: string;
  status: OrderStatus;
  notes: string | null;
  total: number;
  lines: OrderLine[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  lines: { dishId: number; quantity: number; notes: string | null }[];
  notes: string | null;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'En preparación',
  READY: 'Listo',
  SERVED: 'Servido',
  CANCELLED: 'Cancelado',
};

/** Siguiente estado natural de un pedido en curso (null si ya es final). */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case 'PENDING':
      return 'PREPARING';
    case 'PREPARING':
      return 'READY';
    case 'READY':
      return 'SERVED';
    default:
      return null;
  }
}
