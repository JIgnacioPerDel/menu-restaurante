import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiError } from '../../../../core/models/api-error';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { Item, ItemRequest } from '../../models/item';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-item-list',
  imports: [ReactiveFormsModule, DatePipe, ErrorMessage],
  templateUrl: './item-list.html',
  styleUrl: './item-list.scss',
})
export class ItemList implements OnInit {
  private readonly itemService = inject(ItemService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly items = signal<Item[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editingId = signal<number | null>(null);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.itemService.findAll().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err: ApiError) => this.handleError(err),
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, description } = this.form.getRawValue();
    const request: ItemRequest = { name, description: description || null };
    const id = this.editingId();
    const request$ = id === null
      ? this.itemService.create(request)
      : this.itemService.update(id, request);

    request$.subscribe({
      next: () => {
        this.cancelEdit();
        this.load();
      },
      error: (err: ApiError) => this.handleError(err),
    });
  }

  protected edit(item: Item): void {
    this.editingId.set(item.id);
    this.form.setValue({ name: item.name, description: item.description ?? '' });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset();
    this.error.set(null);
  }

  protected remove(item: Item): void {
    if (!confirm(`¿Eliminar "${item.name}"?`)) {
      return;
    }
    this.itemService.delete(item.id).subscribe({
      next: () => this.load(),
      error: (err: ApiError) => this.handleError(err),
    });
  }

  private handleError(err: ApiError): void {
    this.loading.set(false);
    this.error.set(err.message);
  }
}
