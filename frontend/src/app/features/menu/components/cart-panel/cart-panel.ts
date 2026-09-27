import { Component, inject, input, model, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../services/cart.store';

/** Hoja inferior con el resumen del pedido antes de enviarlo. */
@Component({
  selector: 'app-cart-panel',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './cart-panel.html',
  styleUrl: './cart-panel.scss',
})
export class CartPanel {
  protected readonly cart = inject(CartStore);

  readonly tableName = input.required<string>();
  readonly sending = input(false);
  readonly notes = model('');

  readonly close = output<void>();
  readonly submit = output<void>();
}
