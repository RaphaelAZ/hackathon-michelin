import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { CartItem } from '../models/product.model';
import { ProductStore } from './product.store';

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const productStore = inject(ProductStore);

    return {
      itemCount: computed(() =>
        store.items().reduce((total, item) => total + item.quantity, 0),
      ),
      isEmpty: computed(() => store.items().length === 0),
      cartLines: computed(() =>
        store.items().map((item) => {
          const product = productStore.getProductById(item.productId);
          return { ...item, product };
        }),
      ),
      subtotal: computed(() =>
        store
          .items()
          .reduce((total, item) => {
            const product = productStore.getProductById(item.productId);
            return total + (product?.price ?? 0) * item.quantity;
          }, 0),
      ),
      shipping: computed(() => {
        const subtotal = store
          .items()
          .reduce((total, item) => {
            const product = productStore.getProductById(item.productId);
            return total + (product?.price ?? 0) * item.quantity;
          }, 0);
        return subtotal >= 75 ? 0 : 5.99;
      }),
      total: computed(() => {
        const subtotal = store
          .items()
          .reduce((total, item) => {
            const product = productStore.getProductById(item.productId);
            return total + (product?.price ?? 0) * item.quantity;
          }, 0);
        const shipping = subtotal >= 75 ? 0 : 5.99;
        return subtotal + shipping;
      }),
    };
  }),
  withMethods((store) => ({
    addItem(productId: string, quantity = 1): void {
      const existing = store.items().find((item) => item.productId === productId);

      if (existing) {
        patchState(store, {
          items: store.items().map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          ),
        });
        return;
      }

      patchState(store, {
        items: [...store.items(), { productId, quantity }],
      });
    },
    removeItem(productId: string): void {
      patchState(store, {
        items: store.items().filter((item) => item.productId !== productId),
      });
    },
    updateQuantity(productId: string, quantity: number): void {
      if (quantity <= 0) {
        patchState(store, {
          items: store.items().filter((item) => item.productId !== productId),
        });
        return;
      }

      patchState(store, {
        items: store.items().map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        ),
      });
    },
    clear(): void {
      patchState(store, { items: [] });
    },
  })),
);
