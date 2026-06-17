import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const AUTH_ROUTES = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh'];

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthRoute = AUTH_ROUTES.some((route) => req.url.includes(route));
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  const outgoing = token && !isAuthRoute ? addToken(req, token) : req;

  return next(outgoing).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthRoute) {
        return throwError(() => error);
      }

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        router.navigate(['/auth']);
        return throwError(() => error);
      }

      return authService.refresh(refreshToken).pipe(
        switchMap((tokens) => {
          localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
          return next(addToken(req, tokens.access_token));
        }),
        catchError((refreshError) => {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          router.navigate(['/auth']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
