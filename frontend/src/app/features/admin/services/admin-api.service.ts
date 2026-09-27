import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Allergen, Category, Dish } from '../../../core/models/menu';
import { Order, OrderStatus } from '../../../core/models/order';
import { RestaurantTable } from '../../../core/models/table';

export interface CategoryRequest {
  name: string;
  position: number;
}

export interface DishRequest {
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  allergens: Allergen[];
}

export interface TableRequest {
  name: string;
  active: boolean;
}

/** API del panel. El authInterceptor añade el JWT a todas estas peticiones. */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  // Pedidos
  getOrders(scope: 'active' | 'history'): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`, { params: { scope } });
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/orders/${id}/status`, { status });
  }

  // Categorías
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  createCategory(request: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, request);
  }

  updateCategory(id: number, request: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/categories/${id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
  }

  // Platos
  getDishes(): Observable<Dish[]> {
    return this.http.get<Dish[]>(`${this.baseUrl}/dishes`);
  }

  createDish(request: DishRequest): Observable<Dish> {
    return this.http.post<Dish>(`${this.baseUrl}/dishes`, request);
  }

  updateDish(id: number, request: DishRequest): Observable<Dish> {
    return this.http.put<Dish>(`${this.baseUrl}/dishes/${id}`, request);
  }

  deleteDish(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/dishes/${id}`);
  }

  // Mesas
  getTables(): Observable<RestaurantTable[]> {
    return this.http.get<RestaurantTable[]>(`${this.baseUrl}/tables`);
  }

  createTable(request: TableRequest): Observable<RestaurantTable> {
    return this.http.post<RestaurantTable>(`${this.baseUrl}/tables`, request);
  }

  updateTable(id: number, request: TableRequest): Observable<RestaurantTable> {
    return this.http.put<RestaurantTable>(`${this.baseUrl}/tables/${id}`, request);
  }

  regenerateTableToken(id: number): Observable<RestaurantTable> {
    return this.http.post<RestaurantTable>(`${this.baseUrl}/tables/${id}/regenerate-token`, {});
  }

  /** El QR va protegido, así que se descarga como blob con el JWT en vez de usar <img src>. */
  getTableQr(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/tables/${id}/qr`, { responseType: 'blob' });
  }
}
