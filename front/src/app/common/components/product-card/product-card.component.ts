import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Product, TIRE_CATEGORY_LABELS } from '../../../core/models/product.model';
import { CartStore } from '../../../core/stores/cart.store';
import { BadgeComponent } from '../badge/badge.component';
import { ButtonComponent } from '../button/button.component';
import { CardComponent } from '../card/card.component';
import { PriceComponent } from '../price/price.component';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    PriceComponent,
  ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  private readonly cartStore = inject(CartStore);

  readonly product = input.required<Product>();

  protected categoryLabel(): string {
    return TIRE_CATEGORY_LABELS[this.product().category];
  }

  protected addToCart(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartStore.addItem(this.product().id);
  }
}
