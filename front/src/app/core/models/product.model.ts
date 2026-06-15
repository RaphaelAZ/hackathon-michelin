export type TireCategory = 'route' | 'ville' | 'gravel' | 'vtt' | 'competition';

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  category: TireCategory;
  size: string;
  imageUrl: string;
  features: string[];
  inStock: boolean;
  badge?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CheckoutData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
}

export const TIRE_CATEGORY_LABELS: Record<TireCategory, string> = {
  route: 'Route',
  ville: 'Ville',
  gravel: 'Gravel',
  vtt: 'VTT',
  competition: 'Compétition',
};
