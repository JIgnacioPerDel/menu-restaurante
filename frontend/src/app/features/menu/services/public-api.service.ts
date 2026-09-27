import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MenuCategory } from '../../../core/models/menu';
import { CreateOrderRequest, Order } from '../../../core/models/order';
import { PublicTable } from '../../../core/models/table';

@Injectable({ providedIn: 'root' })
export class PublicApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/public`;

  getMenu(): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(`${this.baseUrl}/menu`);
  }

  getTable(token: string): Observable<PublicTable> {
    return this.http.get<PublicTable>(`${this.baseUrl}/tables/${encodeURIComponent(token)}`);
  }

  createOrder(token: string, request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/tables/${encodeURIComponent(token)}/orders`, request);
  }

  getOrders(token: string, ids: number[]): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/tables/${encodeURIComponent(token)}/orders`, {
      params: { ids: ids.join(',') },
    });
  }
}
