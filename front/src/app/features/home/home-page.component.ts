import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductCardComponent } from '../../common/components/product-card/product-card.component';
import { SpinnerComponent } from '../../common/components/spinner/spinner.component';
import { TireSceneComponent } from '../../common/components/tire-scene/tire-scene.component';
import { ProductStore } from '../../core/stores/product.store';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCardComponent, SpinnerComponent, TireSceneComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  private readonly productStore = inject(ProductStore);

  protected readonly featuredProducts = computed(() => this.productStore.getFeaturedProducts());
  protected readonly isLoading = this.productStore.loading;

  protected readonly stats = [
    { value: '99%',    label: 'Clients satisfaits' },
    { value: '130+',   label: 'Ans d\'expertise pneumatique' },
    { value: '1 180g', label: 'Poids record paire carbone' },
    { value: '50mm',   label: 'Hauteur de jante optimale' },
    { value: '3×',     label: 'Plus de durabilité vs pneu standard' },
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
