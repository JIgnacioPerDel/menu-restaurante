import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ALLERGEN_LABELS, Dish, MenuCategory } from '../../../../core/models/menu';

/** Carta agrupada por categorías. Si `canOrder` es true, muestra los controles para pedir. */
@Component({
  selector: 'app-menu-view',
  imports: [CurrencyPipe],
  templateUrl: './menu-view.html',
  styleUrl: './menu-view.scss',
})
export class MenuView {
  readonly categories = input.required<MenuCategory[]>();
  readonly canOrder = input(false);
  readonly quantityOf = input<(dishId: number) => number>(() => 0);

  readonly add = output<Dish>();
  readonly decrease = output<Dish>();

  protected readonly allergenLabels = ALLERGEN_LABELS;

  protected scrollTo(categoryId: number): void {
    document.getElementById(`cat-${categoryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
