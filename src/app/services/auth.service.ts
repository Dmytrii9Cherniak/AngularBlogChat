import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  timer,
  Observable,
  Subscription,
  tap,
  throwError,
  catchError
} from 'rxjs';
import { RegisterModel } from '../models/register/register.model';
import { LoginModel } from '../models/login/login.model';
import { ConfirmCodeResponse } from '../models/confirm_account/confirm.code.response.model';
import { LoginResponseModel } from '../models/login/login.response.model';
import { RegisterResponseModel } from '../models/register/register.response.model';
import { ForgotPasswordModel } from '../models/forgot_password/forgot.password.model';
import { ForgotPasswordEmailConfirmModel } from '../models/forgot_password/forgot.password.email.confirm.model';
import { TokenService } from './token.service';
import { environment } from '../../environments/environment';
import { RefreshTokenResponse } from '../models/token/refresh.token.response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  protected isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.tokenService.hasValidAccessToken()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private tokenExpirationSubscription: Subscription | null = null;

  public get isAuthenticatedValue(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  constructor(
    private httpClient: HttpClient,
    private tokenService: TokenService
  ) {}

  public login(body: LoginModel): Observable<LoginResponseModel> {
    if (this.isAuthenticatedSubject.value) {
      return throwError(() => new Error('User is already authenticated.'));
    }

    return this.httpClient
      .post<LoginResponseModel>(`${environment.apiUrl}/auth/login`, body)
      .pipe(
        tap((response: LoginResponseModel) => {
          if (response.access_token && response.refresh_token) {
            this.tokenService.setAccessToken(response.access_token);
            this.tokenService.setRefreshToken(response.refresh_token);
            this.isAuthenticatedSubject.next(true);
            this.scheduleTokenExpirationCheck();
          }
        })
      );
  }

  public register(body: RegisterModel): Observable<RegisterResponseModel> {
    return this.httpClient.post<RegisterResponseModel>(
      `${environment.apiUrl}/auth/register`,
      body
    );
  }

  public confirmAccount(code: number): Observable<ConfirmCodeResponse> {
    return this.httpClient.post<ConfirmCodeResponse>(
      `${environment.apiUrl}/auth/register-confirm`,
      { code }
    );
  }

  public requestPasswordRecovery(
    email: string
  ): Observable<ForgotPasswordEmailConfirmModel> {
    return this.httpClient.post<ForgotPasswordEmailConfirmModel>(
      `${environment.apiUrl}/auth/request-password-recovery`,
      email
    );
  }

  public resetAccountPassword(
    body: ForgotPasswordModel
  ): Observable<ForgotPasswordModel> {
    return this.httpClient.post<ForgotPasswordModel>(
      `${environment.apiUrl}/auth/password-recovery`,
      body
    );
  }

  public refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token is missing'));
    }

    return this.httpClient
      .post<RefreshTokenResponse>(`${environment.apiUrl}/auth/token/refresh`, {
        refresh: refreshToken
      })
      .pipe(
        tap((newTokens) => {
          if (newTokens.access) {
            this.tokenService.setAccessToken(newTokens.access);
          }
          if (newTokens.refresh) {
            this.tokenService.setRefreshToken(newTokens.refresh);
          }
          this.isAuthenticatedSubject.next(true);
        }),
        catchError((error) => {
          console.error('Refresh token failed:', error);
          return throwError(() => error);
        })
      );
  }

  public scheduleTokenExpirationCheck(): void {
    const token = this.tokenService.getAccessToken();
    if (!token) {
      return;
    }

    const expirationDate = this.tokenService.getTokenExpirationDate(token);
    if (!expirationDate) {
      return;
    }

    const timeUntilRefresh =
      expirationDate.getTime() - new Date().getTime() - 11 * 1000;

    if (this.tokenExpirationSubscription) {
      this.tokenExpirationSubscription.unsubscribe();
    }

    this.tokenExpirationSubscription = timer(timeUntilRefresh).subscribe(() => {
      this.refreshToken().subscribe({
        next: () => this.scheduleTokenExpirationCheck(),
        error: () => {
          console.warn('Token refresh failed. User remains logged in.');
        }
      });
    });
  }

  public logout(): void {
    if (this.tokenExpirationSubscription) {
      this.tokenExpirationSubscription.unsubscribe();
      this.tokenExpirationSubscription = null;
    }

    this.tokenService.removeAccessToken();
    this.tokenService.removeRefreshToken();

    this.isAuthenticatedSubject.next(false);
  }
}
