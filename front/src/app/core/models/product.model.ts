export type TireCategory = 'road' | 'city' | 'gravel' | 'mountain' | 'cargo';

export interface ProductComment {
  id: number;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  category: TireCategory;
  size: string;
  imageUrl: string;
  imageUrls: string[];
  features: string[];
  inStock: boolean;
  badge?: string;
  averageRating?: number | null;
  commentsCount?: number;
  comments?: ProductComment[];
}

export const TIRE_CATEGORY_LABELS: Record<TireCategory, string> = {
  road: 'Route',
  city: 'Ville',
  gravel: 'Gravel',
  mountain: 'VTT',
  cargo: 'Cargo',
};
