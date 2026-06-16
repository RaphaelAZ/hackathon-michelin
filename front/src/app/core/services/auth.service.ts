import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthTokens, LoginRequest, RegisterRequest, User } from '../models/auth.model';

const API = 'http://localhost:8000/api/v1/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(payload: LoginRequest): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${API}/login`, payload);
  }

  register(payload: RegisterRequest): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${API}/register`, payload);
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/logout`, {});
  }

  refresh(refreshToken: string): Observable<Pick<AuthTokens, 'access_token' | 'token_type' | 'expires_in'>> {
    return this.http.post<Pick<AuthTokens, 'access_token' | 'token_type' | 'expires_in'>>(
      `${API}/refresh`,
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } },
    );
  }

  me(): Observable<User> {
    return this.http.get<User>(`${API}/me`);
  }
}
