import { TestBed } from '@angular/core/testing';
import { Dish } from '../../../core/models/menu';
import { CartStore } from './cart.store';

const dish = (id: number, price: number): Dish => ({
  id,
  categoryId: 1,
  name: `Plato ${id}`,
  description: null,
  price,
  available: true,
  allergens: [],
});

describe('CartStore', () => {
  let cart: CartStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [CartStore] });
    cart = TestBed.inject(CartStore);
    cart.init('mesa-test', [dish(1, 9.5), dish(2, 2)]);
  });

  it('adds dishes and calculates count and total', () => {
    cart.add(dish(1, 9.5));
    cart.add(dish(1, 9.5));
    cart.add(dish(2, 2));

    expect(cart.count()).toBe(3);
    expect(cart.total()).toBe(21);
    expect(cart.quantityOf(1)).toBe(2);
  });

  it('removes a line when quantity reaches zero', () => {
    cart.add(dish(1, 9.5));
    cart.setQuantity(1, 0);

    expect(cart.lines().length).toBe(0);
  });

  it('caps quantity at 50', () => {
    cart.add(dish(1, 9.5));
    cart.setQuantity(1, 99);

    expect(cart.quantityOf(1)).toBe(50);
  });

  it('restores the saved cart updating prices and dropping unavailable dishes', () => {
    cart.add(dish(1, 9.5));
    cart.add(dish(2, 2));

    const restored = TestBed.runInInjectionContext(() => new CartStore());
    // El plato 2 ya no está en la carta y el 1 ha subido de precio
    restored.init('mesa-test', [dish(1, 10)]);

    expect(restored.lines().length).toBe(1);
    expect(restored.total()).toBe(10);
  });

  it('keeps separate carts per table', () => {
    cart.add(dish(1, 9.5));

    const otherTable = TestBed.runInInjectionContext(() => new CartStore());
    otherTable.init('otra-mesa', [dish(1, 9.5)]);

    expect(otherTable.count()).toBe(0);
  });
});
