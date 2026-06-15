import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FieldTree,
  FormField,
  email,
  form,
  maxLength,
  minLength,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';

import { ButtonComponent } from '../../common/components/button/button.component';
import { CardComponent } from '../../common/components/card/card.component';
import { FormFieldComponent } from '../../common/components/form-field/form-field.component';
import { PriceComponent } from '../../common/components/price/price.component';
import { CartStore } from '../../core/stores/cart.store';
import { CheckoutStore } from '../../core/stores/checkout.store';

@Component({
  selector: 'app-checkout-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormField,
    ButtonComponent,
    CardComponent,
    FormFieldComponent,
    PriceComponent,
  ],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss'],
})
export class CheckoutPageComponent {
  protected readonly cartStore = inject(CartStore);
  protected readonly checkoutStore = inject(CheckoutStore);

  protected readonly checkoutModel = linkedSignal(() => this.checkoutStore.checkoutData());

  protected readonly checkoutForm = form(this.checkoutModel, (schemaPath) => {
    required(schemaPath.firstName, { message: 'Le prénom est requis' });
    required(schemaPath.lastName, { message: 'Le nom est requis' });
    required(schemaPath.email, { message: 'L\'email est requis' });
    email(schemaPath.email, { message: 'Email invalide' });
    required(schemaPath.phone, { message: 'Le téléphone est requis' });
    minLength(schemaPath.phone, 10, { message: 'Numéro invalide' });
    required(schemaPath.address, { message: 'L\'adresse est requise' });
    required(schemaPath.city, { message: 'La ville est requise' });
    required(schemaPath.postalCode, { message: 'Le code postal est requis' });
    pattern(schemaPath.postalCode, /^\d{5}$/, { message: 'Code postal invalide (5 chiffres)' });
    required(schemaPath.country, { message: 'Le pays est requis' });
    maxLength(schemaPath.notes, 500);
  });

  protected fieldError(field: FieldTree<string, string | number>): string {
    const state = field();
    if (state.invalid() && state.touched()) {
      const errors = state.errors();
      if (errors.length > 0) {
        return errors[0].message ?? 'Champ invalide';
      }
      return 'Champ invalide';
    }
    return '';
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    void submit(this.checkoutForm, async () => {
      this.checkoutStore.updateCheckoutData(this.checkoutModel());
      this.checkoutStore.submitOrder();
      this.cartStore.clear();
      return null;
    });
  }
}
