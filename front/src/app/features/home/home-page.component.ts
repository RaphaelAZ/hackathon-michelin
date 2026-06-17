import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductCardComponent } from '../../common/components/product-card/product-card.component';
import { SpinnerComponent } from '../../common/components/spinner/spinner.component';
import { ProductStore } from '../../core/stores/product.store';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, ProductCardComponent, SpinnerComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  private readonly productStore = inject(ProductStore);

  protected readonly featuredProducts = computed(() => this.productStore.getFeaturedProducts());
  protected readonly isLoading = this.productStore.loading;

  protected readonly techPillars = [
    {
      title: 'Aéro affiné en soufflerie',
      description: 'Profils optimisés sur de multiples angles de lacet pour réduire la traînée à haute vitesse.',
    },
    {
      title: 'Composés hautes performances',
      description: 'Mélanges gomme/carcasse orientés grip, rendement et durabilité sur route comme gravel.',
    },
    {
      title: 'Montage et contrôle qualité',
      description: 'Chaque référence est validée avant expédition pour garantir constance et sécurité.',
    },
    {
      title: 'Confort et précision',
      description: 'Largeurs modernes et structures renforcées pour une tenue de route fiable et confortable.',
    },
  ];

  protected readonly reviews = [
    {
      rating: '★★★★★',
      quote:
        'Très bonne tenue de route et une vraie sensation de rendement. Le pneu reste rassurant même sur route humide.',
      author: 'Léa Moreau',
      role: 'Cycliste route · Lyon',
    },
    {
      rating: '★★★★★',
      quote:
        'Montage simple en tubeless et excellent grip sur chemins mixtes. Super compromis vitesse/confort.',
      author: 'James Tan',
      role: 'Gravel longue distance · Bristol',
    },
    {
      rating: '★★★★★',
      quote:
        'Je roule au quotidien avec, peu de crevaisons et usure régulière. Rapport qualité/prix au top.',
      author: 'Sofia Keller',
      role: 'Mobilité urbaine · Zurich',
    },
  ];
}
