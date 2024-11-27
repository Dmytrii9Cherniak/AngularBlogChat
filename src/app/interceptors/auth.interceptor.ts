import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const token = tokenService.getAccessToken();
  const clonedRequest = req.clone({
    withCredentials: true,
    ...(token && {
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Запобігання зацикленню
      if (error.status === 401 && !req.url.includes('/auth/token/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const newToken = tokenService.getAccessToken();
            const retryRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryRequest);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
