import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiError } from '../../../../core/models/api-error';
import { RestaurantTable } from '../../../../core/models/table';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { AdminApiService } from '../../services/admin-api.service';

/** Mesas y sus códigos QR (RF-18, RF-19, RF-20). */
@Component({
  selector: 'app-tables-page',
  imports: [ReactiveFormsModule, ErrorMessage],
  templateUrl: './tables-page.html',
  styleUrl: './tables-page.scss',
})
export class TablesPage implements OnInit, OnDestroy {
  private readonly api = inject(AdminApiService);

  protected readonly tables = signal<RestaurantTable[]>([]);
  /** URL local (blob:) de la imagen QR de cada mesa, indexada por id. */
  protected readonly qrUrls = signal<Record<number, string>>({});
  protected readonly error = signal<string | null>(null);
  protected readonly editingId = signal<number | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
  });

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    Object.values(this.qrUrls()).forEach((url) => URL.revokeObjectURL(url));
  }

  protected load(): void {
    this.api.getTables().subscribe({
      next: (tables) => {
        this.tables.set(tables);
        tables.forEach((table) => this.loadQr(table));
      },
      error: (err: ApiError) => this.error.set(err.message),
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.getRawValue().name;
    const id = this.editingId();
    const current = this.tables().find((table) => table.id === id);
    const request$ = id
      ? this.api.updateTable(id, { name, active: current?.active ?? true })
      : this.api.createTable({ name, active: true });
    this.run(request$, () => this.cancelEdit());
  }

  protected edit(table: RestaurantTable): void {
    this.editingId.set(table.id);
    this.form.setValue({ name: table.name });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset();
  }

  protected toggleActive(table: RestaurantTable): void {
    this.run(this.api.updateTable(table.id, { name: table.name, active: !table.active }));
  }

  protected regenerate(table: RestaurantTable): void {
    const ok = confirm(
      `Se generará un QR nuevo para ${table.name} y el actual dejará de funcionar. Tendrás que imprimirlo de nuevo. ¿Continuar?`,
    );
    if (ok) {
      this.run(this.api.regenerateTableToken(table.id));
    }
  }

  protected download(table: RestaurantTable): void {
    const url = this.qrUrls()[table.id];
    if (!url) {
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${table.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  }

  protected print(): void {
    window.print();
  }

  private loadQr(table: RestaurantTable): void {
    this.api.getTableQr(table.id).subscribe((blob) => {
      this.qrUrls.update((urls) => {
        if (urls[table.id]) {
          URL.revokeObjectURL(urls[table.id]);
        }
        return { ...urls, [table.id]: URL.createObjectURL(blob) };
      });
    });
  }

  private run(request$: Observable<unknown>, onSuccess?: () => void): void {
    this.error.set(null);
    request$.subscribe({
      next: () => {
        onSuccess?.();
        this.load();
      },
      error: (err: ApiError) => this.error.set(err.message),
    });
  }
}
