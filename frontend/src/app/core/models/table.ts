/** Mesa tal como la ve el cliente. */
export interface PublicTable {
  name: string;
  active: boolean;
}

/** Mesa tal como la ve el administrador. */
export interface RestaurantTable {
  id: number;
  name: string;
  active: boolean;
  token: string;
  orderUrl: string;
}
