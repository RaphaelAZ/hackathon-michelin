import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { PRODUCTS } from '../data/products.data';
import { Product, TireCategory } from '../models/product.model';

interface ProductState {
  products: Product[];
  selectedCategory: TireCategory | 'all';
  searchQuery: string;
}

const initialState: ProductState = {
  products: PRODUCTS,
  selectedCategory: 'all',
  searchQuery: '',
};

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    filteredProducts: computed(() => {
      const query = store.searchQuery().toLowerCase().trim();
      const category = store.selectedCategory();

      return store.products().filter((product) => {
        const matchesCategory = category === 'all' || product.category === category;
        const matchesSearch =
          query === '' ||
          product.name.toLowerCase().includes(query) ||
          product.shortDescription.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
      });
    }),
    categories: computed(() => {
      const categories = new Set(store.products().map((product) => product.category));
      return Array.from(categories);
    }),
  })),
  withMethods((store) => ({
    setCategory(category: TireCategory | 'all'): void {
      patchState(store, { selectedCategory: category });
    },
    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query });
    },
    getProductById(id: string): Product | undefined {
      return store.products().find((product) => product.id === id);
    },
    getFeaturedProducts(): Product[] {
      return store.products().filter((product) => product.inStock).slice(0, 3);
    },
  })),
);
