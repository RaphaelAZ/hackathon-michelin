import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { combineLatest, debounceTime, finalize, switchMap } from 'rxjs';

import { ProductFilters, ProductService } from '../services/product.service';
import { Product, TIRE_CATEGORY_LABELS, TireCategory } from '../models/product.model';

interface ProductState {
  products: Product[];
  loading: boolean;
  selectedCategory: TireCategory | 'all';
  searchQuery: string;
}

const initialState: ProductState = {
  products: [],
  loading: true,
  selectedCategory: 'all',
  searchQuery: '',
};

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(() => ({
    categories: () => Object.keys(TIRE_CATEGORY_LABELS) as TireCategory[],
  })),
  withMethods((store) => ({
    setCategory(category: TireCategory | 'all'): void {
      patchState(store, { selectedCategory: category });
    },
    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query });
    },
    getFeaturedProducts(): Product[] {
      return store.products().filter((product: Product) => product.inStock).slice(0, 3);
    },
    getProductById(id: string): Product | undefined {
      return store.products().find((product: Product) => product.id === id);
    },
  })),
  withHooks({
    onInit(store) {
      const productService = inject(ProductService);

      combineLatest([
        toObservable(store.searchQuery),
        toObservable(store.selectedCategory),
      ])
        .pipe(
          debounceTime(300),
          switchMap(([search, category]) => {
            patchState(store, { loading: true });
            const filters: ProductFilters = { search, category };
            return productService.getAll(filters).pipe(
              finalize(() => patchState(store, { loading: false })),
            );
          }),
        )
        .subscribe((products) => patchState(store, { products }));
    },
  }),
);
