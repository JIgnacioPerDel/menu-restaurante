import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="admin-header no-print">
      <span class="brand">Panel · Menú Restaurante</span>
      <nav>
        <a routerLink="pedidos" routerLinkActive="active">Pedidos</a>
        <a routerLink="carta" routerLinkActive="active">Carta</a>
        <a routerLink="mesas" routerLinkActive="active">Mesas y QR</a>
      </nav>
      <div class="session">
        <span class="muted">{{ auth.username() }}</span>
        <button type="button" class="btn btn-sm" (click)="auth.logout()">Salir</button>
      </div>
    </header>
    <main class="admin-main">
      <router-outlet />
    </main>
  `,
  styles: `
    .admin-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem 1.5rem;
      padding: 0.75rem 1.25rem;
      color: #fff;
      background: var(--color-dark);
    }
    .brand {
      font-weight: 700;
    }
    nav {
      display: flex;
      gap: 0.25rem;
      flex: 1;
    }
    nav a {
      padding: 0.4rem 0.75rem;
      border-radius: var(--radius);
      color: #d6d3d1;
      text-decoration: none;
    }
    nav a.active,
    nav a:hover {
      color: #fff;
      background: rgb(255 255 255 / 0.12);
    }
    .session {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .session .muted {
      color: #a8a29e;
    }
    .admin-main {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 3rem;
    }
  `,
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
}
