import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { CheckoutData } from '../models/product.model';

interface CheckoutState {
  checkoutData: CheckoutData;
  isSubmitted: boolean;
  orderNumber: string;
}

const emptyCheckoutData: CheckoutData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'France',
  notes: '',
};

const initialState: CheckoutState = {
  checkoutData: emptyCheckoutData,
  isSubmitted: false,
  orderNumber: '',
};

export const CheckoutStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasOrder: computed(() => store.isSubmitted() && store.orderNumber() !== ''),
  })),
  withMethods((store) => ({
    updateCheckoutData(data: Partial<CheckoutData>): void {
      patchState(store, {
        checkoutData: { ...store.checkoutData(), ...data },
      });
    },
    submitOrder(): string {
      const orderNumber = `MV-${Date.now().toString(36).toUpperCase()}`;
      patchState(store, { isSubmitted: true, orderNumber });
      return orderNumber;
    },
    reset(): void {
      patchState(store, {
        checkoutData: emptyCheckoutData,
        isSubmitted: false,
        orderNumber: '',
      });
    },
  })),
);
