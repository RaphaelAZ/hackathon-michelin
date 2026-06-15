import { Routes } from '@angular/router';

import { MainLayoutComponent } from './common/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home-page.component').then((m) => m.HomePageComponent),
        title: 'Accueil — Michelin Vélo',
      },
      {
        path: 'pneus',
        loadComponent: () =>
          import('./features/catalog/catalog-page.component').then((m) => m.CatalogPageComponent),
        title: 'Nos pneus — Michelin Vélo',
      },
      {
        path: 'pneus/:id',
        loadComponent: () =>
          import('./features/product-detail/product-detail-page.component').then(
            (m) => m.ProductDetailPageComponent,
          ),
        title: 'Détail produit — Michelin Vélo',
      },
      {
        path: 'panier',
        loadComponent: () =>
          import('./features/cart/cart-page.component').then((m) => m.CartPageComponent),
        title: 'Panier — Michelin Vélo',
      },
      {
        path: 'commande',
        loadComponent: () =>
          import('./features/checkout/checkout-page.component').then((m) => m.CheckoutPageComponent),
        title: 'Commande — Michelin Vélo',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
