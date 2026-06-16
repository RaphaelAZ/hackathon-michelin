import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BadgeComponent } from '../../common/components/badge/badge.component';
import { ButtonComponent } from '../../common/components/button/button.component';
import { PriceComponent } from '../../common/components/price/price.component';
import { QuantitySelectorComponent } from '../../common/components/quantity-selector/quantity-selector.component';
import { SpinnerComponent } from '../../common/components/spinner/spinner.component';
import { Product, TIRE_CATEGORY_LABELS } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartStore } from '../../core/stores/cart.store';

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
    SpinnerComponent,
  ],
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.scss'],
})
export class ProductDetailPageComponent {
  private readonly productService = inject(ProductService);
  private readonly cartStore = inject(CartStore);

  readonly id = input.required<string>();

  protected readonly product = signal<Product | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly quantity = signal(1);

  protected readonly categoryLabel = computed(() => {
    const p = this.product();
    return p ? TIRE_CATEGORY_LABELS[p.category] : '';
  });

  constructor() {
    effect(() => {
      const slug = this.id();
      this.isLoading.set(true);
      this.notFound.set(false);
      this.product.set(null);

      this.productService.getBySlug(slug).subscribe({
        next: (p) => {
          this.product.set(p);
          this.isLoading.set(false);
        },
        error: () => {
          this.notFound.set(true);
          this.isLoading.set(false);
        },
      });
    });
  }

  protected addToCart(): void {
    const p = this.product();
    if (p) {
      this.cartStore.addItem(p.id, this.quantity());
    }
  }
}
