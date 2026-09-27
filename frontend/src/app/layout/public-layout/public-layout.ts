import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="public-header">
      <a routerLink="/carta" class="brand">
        <span class="brand-mark" aria-hidden="true">🍽</span>
        Menú Restaurante
      </a>
    </header>
    <main class="public-main">
      <router-outlet />
    </main>
  `,
  styles: `
    .public-header {
      position: sticky;
      top: 0;
      z-index: 20;
      padding: 0.85rem 1rem;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--color-text);
      text-decoration: none;
    }
    .public-main {
      max-width: 760px;
      margin: 0 auto;
      padding: 1rem 1rem 7rem;
    }
  `,
})
export class PublicLayout {}
