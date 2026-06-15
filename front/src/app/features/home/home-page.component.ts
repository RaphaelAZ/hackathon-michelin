import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../common/components/button/button.component';
import { ProductCardComponent } from '../../common/components/product-card/product-card.component';
import { ProductStore } from '../../core/stores/product.store';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, ProductCardComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  private readonly productStore = inject(ProductStore);

  protected readonly featuredProducts = computed(() => this.productStore.getFeaturedProducts());

  protected readonly features = [
    {
      icon: '🏆',
      title: 'Expertise reconnue',
      description: 'Plus de 130 ans d\'innovation au service des cyclistes du monde entier.',
    },
    {
      icon: '🛡️',
      title: 'Sécurité maximale',
      description: 'Technologies anti-crevaison et adhérence optimale sur tous les terrains.',
    },
    {
      icon: '🌱',
      title: 'Engagement durable',
      description: 'Pneus conçus pour durer plus longtemps et réduire l\'impact environnemental.',
    },
  ];
}
