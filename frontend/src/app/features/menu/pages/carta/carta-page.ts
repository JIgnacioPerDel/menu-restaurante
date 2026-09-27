import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiError } from '../../../../core/models/api-error';
import { MenuCategory } from '../../../../core/models/menu';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { MenuView } from '../../components/menu-view/menu-view';
import { PublicApiService } from '../../services/public-api.service';

/** Carta de solo lectura, sin mesa (RF-04). */
@Component({
  selector: 'app-carta-page',
  imports: [MenuView, ErrorMessage],
  template: `
    <h1 class="page-title">Nuestra carta</h1>
    <p class="muted intro">Para pedir desde el móvil, escanea el código QR de tu mesa.</p>
    <app-error-message [message]="error()" />
    @if (loading()) {
      <p class="muted">Cargando carta…</p>
    } @else {
      <app-menu-view [categories]="menu()" />
    }
  `,
  styles: `
    .intro {
      margin-top: -0.5rem;
    }
  `,
})
export class CartaPage implements OnInit {
  private readonly api = inject(PublicApiService);

  protected readonly menu = signal<MenuCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.api.getMenu().subscribe({
      next: (menu) => {
        this.menu.set(menu);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
