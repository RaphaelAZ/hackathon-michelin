import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ProductCardComponent } from '../../common/components/product-card/product-card.component';
import { TIRE_CATEGORY_LABELS, TireCategory } from '../../core/models/product.model';
import { ProductStore } from '../../core/stores/product.store';

@Component({
  selector: 'app-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent],
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.scss'],
})
export class CatalogPageComponent {
  protected readonly productStore = inject(ProductStore);
  protected readonly categoryLabels = TIRE_CATEGORY_LABELS;

  protected onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.productStore.setSearchQuery(input.value);
  }

  protected setCategory(category: TireCategory | 'all'): void {
    this.productStore.setCategory(category);
  }
}
