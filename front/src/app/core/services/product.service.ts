import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Product, TireCategory } from '../models/product.model';

export interface ProductFilters {
  search?: string;
  category?: TireCategory | 'all';
}

interface ApiProduct {
  id: number;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  price: string;
  category: string;
  size: string;
  image_url: string;
  features: string[];
  in_stock: boolean;
  badge: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  getAll(filters?: ProductFilters): Observable<Product[]> {
    let params = new HttpParams();
    if (filters?.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }
    if (filters?.category && filters.category !== 'all') {
      params = params.set('category', filters.category);
    }

    return this.http
      .get<{ data: ApiProduct[] }>('http://localhost:8000/api/v1/products', { params })
      .pipe(map((response) => response.data.map(this.mapProduct)));
  }

  getBySlug(slug: string): Observable<Product> {
    return this.http
      .get<{ data: ApiProduct }>(`http://localhost:8000/api/v1/products/${slug}`)
      .pipe(map((response) => this.mapProduct(response.data)));
  }

  private mapProduct(api: ApiProduct): Product {
    return {
      id: api.slug,
      name: api.name,
      shortDescription: api.short_description,
      description: api.description,
      price: Number(api.price),
      category: api.category as TireCategory,
      size: api.size,
      imageUrl: api.image_url,
      features: api.features,
      inStock: api.in_stock,
      badge: api.badge ?? undefined,
    };
  }
}
