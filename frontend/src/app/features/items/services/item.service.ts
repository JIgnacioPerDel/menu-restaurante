import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Item, ItemRequest } from '../models/item';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/items`;

  findAll(): Observable<Item[]> {
    return this.http.get<Item[]>(this.baseUrl);
  }

  findById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/${id}`);
  }

  create(request: ItemRequest): Observable<Item> {
    return this.http.post<Item>(this.baseUrl, request);
  }

  update(id: number, request: ItemRequest): Observable<Item> {
    return this.http.put<Item>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
