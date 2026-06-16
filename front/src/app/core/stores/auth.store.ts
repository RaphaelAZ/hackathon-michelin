import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { tap } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { LoginRequest, RegisterRequest, User } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return {
      login(payload: LoginRequest): void {
        patchState(store, { loading: true, error: null });
        authService.login(payload).subscribe({
          next: (tokens) => {
            localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
            localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
            authService.me().subscribe({
              next: (user) => {
                patchState(store, { user, loading: false });
                router.navigate(['/pneus']);
              },
              error: () => patchState(store, { loading: false }),
            });
          },
          error: (err) => {
            const message = err.status === 401 ? 'Email ou mot de passe incorrect.' : 'Une erreur est survenue.';
            patchState(store, { loading: false, error: message });
          },
        });
      },

      register(payload: RegisterRequest): void {
        patchState(store, { loading: true, error: null });
        authService.register(payload).subscribe({
          next: (tokens) => {
            localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
            localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
            authService.me().subscribe({
              next: (user) => {
                patchState(store, { user, loading: false });
                router.navigate(['/pneus']);
              },
              error: () => patchState(store, { loading: false }),
            });
          },
          error: (err) => {
            const message =
              err.status === 422 ? 'Cet email est déjà utilisé.' : 'Une erreur est survenue lors de l\'inscription.';
            patchState(store, { loading: false, error: message });
          },
        });
      },

      logout(): void {
        authService
          .logout()
          .pipe(tap(() => {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            patchState(store, { user: null });
            router.navigate(['/auth']);
          }))
          .subscribe();
      },

      loadCurrentUser(): void {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (!token) {
          return;
        }
        patchState(store, { loading: true });
        authService.me().subscribe({
          next: (user) => patchState(store, { user, loading: false }),
          error: () => {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            patchState(store, { loading: false });
          },
        });
      },

      getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
      },

      getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
      },

      setTokens(accessToken: string): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      },

      clearTokens(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        patchState(store, { user: null });
      },

      isAuthenticated(): boolean {
        return !!localStorage.getItem(ACCESS_TOKEN_KEY);
      },
    };
  }),
);
