export type Allergen =
  | 'GLUTEN' | 'CRUSTACEANS' | 'EGGS' | 'FISH' | 'PEANUTS' | 'SOY' | 'MILK'
  | 'NUTS' | 'CELERY' | 'MUSTARD' | 'SESAME' | 'SULPHITES' | 'LUPIN' | 'MOLLUSCS';

export interface Dish {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  allergens: Allergen[];
}

export interface MenuCategory {
  id: number;
  name: string;
  dishes: Dish[];
}

export interface Category {
  id: number;
  name: string;
  position: number;
}

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  GLUTEN: 'Gluten',
  CRUSTACEANS: 'Crustáceos',
  EGGS: 'Huevo',
  FISH: 'Pescado',
  PEANUTS: 'Cacahuetes',
  SOY: 'Soja',
  MILK: 'Lácteos',
  NUTS: 'Frutos de cáscara',
  CELERY: 'Apio',
  MUSTARD: 'Mostaza',
  SESAME: 'Sésamo',
  SULPHITES: 'Sulfitos',
  LUPIN: 'Altramuces',
  MOLLUSCS: 'Moluscos',
};

export const ALLERGENS = Object.keys(ALLERGEN_LABELS) as Allergen[];
