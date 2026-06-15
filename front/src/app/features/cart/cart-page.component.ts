import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../common/components/button/button.component';
import { PriceComponent } from '../../common/components/price/price.component';
import { QuantitySelectorComponent } from '../../common/components/quantity-selector/quantity-selector.component';
import { CartStore } from '../../core/stores/cart.store';

@Component({
  selector: 'app-cart-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    RouterLink,
    ButtonComponent,
    PriceComponent,
    QuantitySelectorComponent,
  ],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss'],
})
export class CartPageComponent {
  protected readonly cartStore = inject(CartStore);

  protected remainingForFreeShipping(): string {
    const remaining = 75 - this.cartStore.subtotal();
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(remaining);
  }
}
