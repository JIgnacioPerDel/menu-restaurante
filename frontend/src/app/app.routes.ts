import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'carta', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () => import('./layout/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: 'carta',
        title: 'Carta',
        loadComponent: () => import('./features/menu/pages/carta/carta-page').then((m) => m.CartaPage),
      },
      {
        path: 'mesa/:token',
        title: 'Pedir en mesa',
        loadComponent: () => import('./features/menu/pages/table/table-page').then((m) => m.TablePage),
      },
    ],
  },
  {
    path: 'admin/login',
    title: 'Acceso al panel',
    loadComponent: () => import('./features/admin/pages/login/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'pedidos', pathMatch: 'full' },
      {
        path: 'pedidos',
        title: 'Pedidos',
        loadComponent: () => import('./features/admin/pages/orders/orders-page').then((m) => m.OrdersPage),
      },
      {
        path: 'carta',
        title: 'Gestionar carta',
        loadComponent: () =>
          import('./features/admin/pages/menu-admin/menu-admin-page').then((m) => m.MenuAdminPage),
      },
      {
        path: 'mesas',
        title: 'Mesas y QR',
        loadComponent: () => import('./features/admin/pages/tables/tables-page').then((m) => m.TablesPage),
      },
    ],
  },
  { path: '**', redirectTo: 'carta' },
];
