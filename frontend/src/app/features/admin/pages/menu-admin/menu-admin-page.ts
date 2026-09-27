import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { ApiError } from '../../../../core/models/api-error';
import { ALLERGENS, ALLERGEN_LABELS, Allergen, Category, Dish } from '../../../../core/models/menu';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { AdminApiService, DishRequest } from '../../services/admin-api.service';

/** Gestión de categorías y platos (RF-16, RF-17). */
@Component({
  selector: 'app-menu-admin-page',
  imports: [ReactiveFormsModule, CurrencyPipe, ErrorMessage],
  templateUrl: './menu-admin-page.html',
  styleUrl: './menu-admin-page.scss',
})
export class MenuAdminPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly categories = signal<Category[]>([]);
  protected readonly dishes = signal<Dish[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly editingCategoryId = signal<number | null>(null);
  /** null = formulario cerrado, 0 = plato nuevo, >0 = editando ese plato */
  protected readonly editingDishId = signal<number | null>(null);

  protected readonly allergens = ALLERGENS;
  protected readonly allergenLabels = ALLERGEN_LABELS;

  protected readonly dishesByCategory = computed(() => {
    const groups = new Map<number, Dish[]>();
    for (const dish of this.dishes()) {
      groups.set(dish.categoryId, [...(groups.get(dish.categoryId) ?? []), dish]);
    }
    return groups;
  });

  protected readonly categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    position: [1, [Validators.required, Validators.min(0)]],
  });

  protected readonly dishForm = this.fb.group({
    categoryId: [0, [Validators.required, Validators.min(1)]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    price: [0, [Validators.required, Validators.min(0)]],
    available: [true],
    allergens: [[] as Allergen[]],
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    forkJoin({ categories: this.api.getCategories(), dishes: this.api.getDishes() }).subscribe({
      next: ({ categories, dishes }) => {
        this.categories.set(categories);
        this.dishes.set(dishes);
      },
      error: (err: ApiError) => this.error.set(err.message),
    });
  }

  // ---------- Categorías ----------

  protected editCategory(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.setValue({ name: category.name, position: category.position });
  }

  protected resetCategoryForm(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({ name: '', position: this.categories().length + 1 });
  }

  protected saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    const request = this.categoryForm.getRawValue();
    const id = this.editingCategoryId();
    this.run(id ? this.api.updateCategory(id, request) : this.api.createCategory(request), () =>
      this.resetCategoryForm(),
    );
  }

  protected deleteCategory(category: Category): void {
    if (confirm(`¿Eliminar la categoría "${category.name}"?`)) {
      this.run(this.api.deleteCategory(category.id));
    }
  }

  // ---------- Platos ----------

  protected newDish(categoryId?: number): void {
    this.editingDishId.set(0);
    this.dishForm.reset({
      categoryId: categoryId ?? this.categories()[0]?.id ?? 0,
      name: '',
      description: '',
      price: 0,
      available: true,
      allergens: [],
    });
  }

  protected editDish(dish: Dish): void {
    this.editingDishId.set(dish.id);
    this.dishForm.setValue({
      categoryId: dish.categoryId,
      name: dish.name,
      description: dish.description ?? '',
      price: dish.price,
      available: dish.available,
      allergens: [...dish.allergens],
    });
  }

  protected closeDishForm(): void {
    this.editingDishId.set(null);
  }

  protected hasAllergen(allergen: Allergen): boolean {
    return this.dishForm.controls.allergens.value.includes(allergen);
  }

  protected toggleAllergen(allergen: Allergen): void {
    const current = this.dishForm.controls.allergens.value;
    this.dishForm.controls.allergens.setValue(
      current.includes(allergen) ? current.filter((a) => a !== allergen) : [...current, allergen],
    );
  }

  protected saveDish(): void {
    if (this.dishForm.invalid) {
      this.dishForm.markAllAsTouched();
      return;
    }
    const value = this.dishForm.getRawValue();
    const request: DishRequest = { ...value, description: value.description.trim() || null };
    const id = this.editingDishId();
    this.run(id ? this.api.updateDish(id, request) : this.api.createDish(request), () => this.closeDishForm());
  }

  /** Marcar un plato como agotado o disponible con un clic. */
  protected toggleAvailable(dish: Dish): void {
    this.run(this.api.updateDish(dish.id, { ...dish, available: !dish.available }));
  }

  protected deleteDish(dish: Dish): void {
    if (confirm(`¿Eliminar "${dish.name}" de la carta?`)) {
      this.run(this.api.deleteDish(dish.id));
    }
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
