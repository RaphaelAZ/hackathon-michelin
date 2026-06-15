import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BadgeComponent } from '../../common/components/badge/badge.component';
import { ButtonComponent } from '../../common/components/button/button.component';
import { PriceComponent } from '../../common/components/price/price.component';
import { QuantitySelectorComponent } from '../../common/components/quantity-selector/quantity-selector.component';
import { TIRE_CATEGORY_LABELS } from '../../core/models/product.model';
import { CartStore } from '../../core/stores/cart.store';
import { ProductStore } from '../../core/stores/product.store';

@Component({
  selector: 'app-product-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    PriceComponent,
    QuantitySelectorComponent,
  ],
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.scss'],
})
export class ProductDetailPageComponent {
  private readonly productStore = inject(ProductStore);
  private readonly cartStore = inject(CartStore);

  readonly id = input.required<string>();

  protected readonly quantity = signal(1);

  protected readonly product = computed(() => this.productStore.getProductById(this.id()));

  protected readonly categoryLabel = computed(() => {
    const p = this.product();
    return p ? TIRE_CATEGORY_LABELS[p.category] : '';
  });

  protected addToCart(): void {
    const p = this.product();
    if (p) {
      this.cartStore.addItem(p.id, this.quantity());
    }
  }
}
