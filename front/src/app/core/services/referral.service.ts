import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { ReferralDashboard, SponsoredUser } from '../models/referral.model';

interface ApiSponsoredUser {
  name: string;
  email: string;
  created_at: string;
}

interface ApiReferralDashboard {
  referral_code: string;
  sponsored_users: ApiSponsoredUser[];
}

@Injectable({ providedIn: 'root' })
export class ReferralService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<ReferralDashboard> {
    return this.http
      .get<ApiReferralDashboard>('http://localhost:8000/api/v1/parrainage')
      .pipe(map((response) => this.mapDashboard(response)));
  }

  private mapDashboard(api: ApiReferralDashboard): ReferralDashboard {
    return {
      referralCode: api.referral_code,
      sponsoredUsers: api.sponsored_users.map((user) => this.mapSponsoredUser(user)),
    };
  }

  private mapSponsoredUser(api: ApiSponsoredUser): SponsoredUser {
    return {
      name: api.name,
      email: api.email,
      createdAt: api.created_at,
    };
  }
}