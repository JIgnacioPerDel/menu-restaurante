import { Routes } from '@angular/router';

export const ITEMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/item-list/item-list').then((m) => m.ItemList),
  },
];
