import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { DealerInfo } from '../../common/components/dealer-modal/dealer-modal.component';

interface ApiReseller {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string | null;
  is_recommended: boolean;
}

@Injectable({ providedIn: 'root' })
export class ResellerService {
  private readonly http = inject(HttpClient);

  getByProductSlug(slug: string): Observable<DealerInfo[]> {
    return this.http
      .get<{ data: ApiReseller[] }>(`http://localhost:8000/api/v1/products/${slug}/resellers`)
      .pipe(map((response) => response.data.map((item) => this.mapReseller(item))));
  }

  private mapReseller(api: ApiReseller): DealerInfo {
    return {
      name: api.name,
      address: api.address,
      city: this.extractCity(api.address),
      distance: api.is_recommended ? 'Revendeur recommande' : 'Revendeur partenaire',
      phone: api.phone || 'Telephone non renseigne',
      hours: 'Horaires non renseignes',
      services: this.buildServices(api),
    };
  }

  private extractCity(address: string): string {
    const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
    return parts.length > 1 ? parts[parts.length - 1] : address;
  }

  private buildServices(api: ApiReseller): string[] {
    const services = ['Conseil pneus', 'Montage en atelier'];

    if (api.is_recommended) {
      services.unshift('Partenaire recommande');
    }

    if (api.website) {
      services.push('Reservation en ligne');
    }

    return services;
  }
}