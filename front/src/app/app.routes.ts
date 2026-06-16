import { Routes } from '@angular/router';

import { MainLayoutComponent } from './common/layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
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
      {
        path: 'parrainage',
        loadComponent: () =>
          import('./features/referral/referral-page.component').then((m) => m.ReferralPageComponent),
        title: 'Parrainage — Michelin Vélo',
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth-page.component').then((m) => m.AuthPageComponent),
    title: 'Connexion — Michelin Vélo',
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
