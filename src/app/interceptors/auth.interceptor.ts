import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  throwError,
  switchMap,
  filter,
  take,
  catchError
} from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

const isRefreshing = new BehaviorSubject<boolean>(false);
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const accessToken = tokenService.getAccessToken();
  const clonedReq = addAuthHeader(req, accessToken);

  return next(clonedReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next, authService, tokenService);
      }
      return throwError(() => error);
    })
  );
};

function addAuthHeader(request: HttpRequest<any>, token: string | null) {
  const tokenService = inject(TokenService);

  if (token && tokenService.isTokenFormatValid(token)) {
    return request.clone({
      withCredentials: true,
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return request;
}

function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  tokenService: TokenService
): Observable<HttpEvent<any>> {
  if (!isRefreshing.value) {
    isRefreshing.next(true);
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((newToken) => {
        isRefreshing.next(false);
        refreshTokenSubject.next(newToken.access_token);
        tokenService.saveAccessToken(newToken.access_token);
        return next(addAuthHeader(req, newToken.access_token));
      }),
      catchError((err) => {
        isRefreshing.next(false);
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(addAuthHeader(req, token as string)))
    );
  }
}
