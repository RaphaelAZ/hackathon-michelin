# Contexte Front - Hackathon Michelin

## Objectif actuel
Construire le front d'un site e-commerce Michelin pour la vente de pneus de velo.
Le projet est encore en phase de base (MVP), avec les parcours principaux en place.

## Stack technique
- Angular 21 (standalone components, lazy loading des pages)
- TypeScript strict (`strict`, `strictTemplates`, etc.)
- State management avec `@ngrx/signals`
- Styles par composant (SCSS)

## Fonctionnalites deja en place
- **Navigation principale**
  - Accueil (`/`)
  - Catalogue pneus (`/pneus`)
  - Detail produit (`/pneus/:id`)
  - Panier (`/panier`)
  - Checkout/commande (`/commande`)
- **Catalogue produits**
  - Donnees produits locales (mock) dans `src/app/core/data/products.data.ts`
  - Categories de pneus (route, ville, gravel, vtt, competition)
  - Recherche texte + filtre categorie via `ProductStore`
- **Detail produit**
  - Chargement d'un produit par `id`
  - Choix de quantite
  - Ajout au panier
- **Panier**
  - Ajout/suppression/mise a jour de quantite
  - Calculs derives: nombre d'articles, sous-total, livraison, total
  - Regle livraison: gratuite a partir de 75 EUR, sinon 5.99 EUR

## Organisation actuelle du code
- `src/app/core/`
  - `data/` : donnees mock (produits)
  - `models/` : types/metiers produit/panier
  - `stores/` : logique et etat global front (`product.store`, `cart.store`, `checkout.store`)
- `src/app/features/`
  - pages metier: `home`, `catalog`, `product-detail`, `cart`, `checkout`
- `src/app/common/`
  - composants UI reutilisables (`button`, `badge`, `price`, `product-card`, `quantity-selector`, etc.)
  - layout global (`header`, `footer`, `main-layout`)

## Etat des donnees et backend
- Pas d'API backend branchee pour le moment
- Les produits sont statiques (fichier TS local)
- Le panier est gere cote front via store

## Niveau d'avancement (lecture rapide)
- Base front e-commerce fonctionnelle pour naviguer, consulter des produits et gerer un panier
- Focus actuel: architecture propre + UX de base + logique metier front
- Reste a venir: connexion backend, auth, paiement, persistance panier, tests plus complets, optimisation

## Points d'attention pour la suite
- Conserver l'approche signals/store deja en place
- Garder les pages en lazy loading
- Ne pas casser les regles de calcul panier (seuil de livraison)
- Introduire les APIs progressivement en remplacant les mocks sans casser les composants
