import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Product, ProductComment, TireCategory } from '../models/product.model';

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
  image_urls?: string[];
  features: string[];
  in_stock: boolean;
  badge: string | null;
  average_rating?: number | null;
  comments_count?: number;
  comments?: ApiComment[];
}

interface ApiComment {
  id: number;
  rating: number;
  comment: string;
  author_name: string;
  created_at: string;
}

interface CreateCommentPayload {
  rating: number;
  comment: string;
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
      .get<{ data: ApiProduct[] }>('/api/v1/products', { params })
      .pipe(map((response) => response.data.map(this.mapProduct)));
  }

  getBySlug(slug: string): Observable<Product> {
    return this.http
      .get<{ data: ApiProduct }>(`/api/v1/products/${slug}`)
      .pipe(map((response) => this.mapProduct(response.data)));
  }

  createComment(slug: string, payload: CreateCommentPayload): Observable<ProductComment> {
    return this.http
      .post<{ data: ApiComment }>(`/api/v1/products/${slug}/comments`, payload)
      .pipe(map((response) => this.mapComment(response.data)));
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
      imageUrls: api.image_urls && api.image_urls.length > 0 ? api.image_urls : [api.image_url],
      features: api.features,
      inStock: api.in_stock,
      badge: api.badge ?? undefined,
      averageRating: api.average_rating ?? null,
      commentsCount: api.comments_count ?? 0,
      comments: api.comments?.map((comment) => this.mapComment(comment)) ?? [],
    };
  }

  private mapComment(api: ApiComment): ProductComment {
    return {
      id: api.id,
      rating: api.rating,
      comment: api.comment,
      authorName: api.author_name,
      createdAt: api.created_at,
    };
  }
}
