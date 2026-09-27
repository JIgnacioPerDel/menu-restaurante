import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <a class="brand" routerLink="/">Proyecto Base</a>
      <nav>
        <a routerLink="/items" routerLinkActive="active">Items</a>
      </nav>
    </header>
  `,
  styles: `
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }
    .brand {
      font-weight: 700;
      color: var(--color-text);
      text-decoration: none;
    }
    nav a {
      color: var(--color-muted);
      text-decoration: none;
    }
    nav a.active {
      color: var(--color-primary);
      font-weight: 600;
    }
  `,
})
export class Header {}
