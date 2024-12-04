import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  tap,
  throwError,
  catchError,
  switchMap,
  map
} from 'rxjs';
import { RegisterModel } from '../models/register/register.model';
import { LoginModel } from '../models/login/login.model';
import { ConfirmCodeResponse } from '../models/confirm_account/confirm.code.response.model';
import { RegisterResponseModel } from '../models/register/register.response.model';
import { ForgotPasswordModel } from '../models/forgot_password/forgot.password.model';
import { ForgotPasswordEmailConfirmModel } from '../models/forgot_password/forgot.password.email.confirm.model';
import { TokenService } from './token.service';
import { environment } from '../../environments/environment';
import { UserDataModel } from '../models/user/user.data.model';
import { UserService } from './user.service';
import { WebsocketsService } from './websockets.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private broadcastChannel = new BroadcastChannel('auth-channel');
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private uniqueTabId = Math.random().toString(36).substr(2, 9);

  private accessTokenTimer: any;
  private refreshTokenTimer: any;

  constructor(
    private httpClient: HttpClient,
    private tokenService: TokenService,
    private userService: UserService,
    private websocketsService: WebsocketsService
  ) {
    this.broadcastChannel.onmessage = (event) => {
      const { type, source } = event.data || {};
      if (source === this.uniqueTabId) {
        return;
      }

      if (type === 'logout') {
        this.handleLogoutSync();
      } else if (type === 'login') {
        this.handleLoginSync();
      }
    };
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

  setAuthenticated(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  login(
    body: LoginModel
  ): Observable<{ access_token: string; user: UserDataModel }> {
    if (this.isAuthenticatedSubject.value) {
      throw new Error('User is already logged in.');
    }

    return this.httpClient
      .post<{
        access_token: string;
      }>(`${environment.apiUrl}/auth/login`, body, { withCredentials: true })
      .pipe(
        switchMap((response) => {
          this.tokenService.saveAccessToken(response.access_token);
          this.setAuthenticated(true);

          this.clearTimers();
          this.startRefreshTokenExpiryTimer();

          this.broadcastChannel.postMessage({
            type: 'login',
            source: this.uniqueTabId
          });

          return this.httpClient
            .get<UserDataModel>(`${environment.apiUrl}/profile/user-data`, {
              withCredentials: true
            })
            .pipe(
              tap((userData) => {
                this.userService.userProfileData.next(userData);
              }),
              map((userData) => ({
                access_token: response.access_token,
                user: userData
              }))
            );
        }),
        catchError((error) => {
          console.error('Login failed:', error);
          return throwError(() => error);
        })
      );
  }

  refreshToken(): Observable<{ access_token: string }> {
    return this.httpClient
      .post<{
        access_token: string;
      }>(
        `${environment.apiUrl}/auth/token/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          this.tokenService.saveAccessToken(response.access_token);
        }),
        catchError((error) => {
          console.error('Refresh token failed:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    if (!this.isAuthenticatedSubject.value) {
      return;
    }

    this.broadcastChannel.postMessage({
      type: 'logout',
      source: this.uniqueTabId
    });
    this.websocketsService.disconnect();
    this.setAuthenticated(false);
    this.tokenService.clearTokens();
    this.clearTimers();
  }

  startRefreshTokenExpiryTimer(): void {
    this.clearTimers();

    const now = Date.now();
    const accessTokenExpiry = now + 20000; // 20 секунд для access_token
    const refreshTokenExpiry = now + 50000; // 50 секунд для refresh_token

    localStorage.setItem('accessTokenExpiry', accessTokenExpiry.toString());
    localStorage.setItem('refreshTokenExpiry', refreshTokenExpiry.toString());

    this.accessTokenTimer = setTimeout(() => {
      this.refreshToken().subscribe();
    }, 20000);

    this.refreshTokenTimer = setTimeout(() => {
      this.logout();
    }, 50000);
  }

  private clearTimers(): void {
    if (this.accessTokenTimer) {
      clearInterval(this.accessTokenTimer);
    }
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }
  }

  private handleLogoutSync(): void {
    if (!this.isAuthenticatedSubject.value) {
      return;
    }

    this.logout();
  }

  private handleLoginSync(): void {
    this.setAuthenticated(true);
    this.startRefreshTokenExpiryTimer();

    this.httpClient
      .get<UserDataModel>(`${environment.apiUrl}/profile/user-data`, {
        withCredentials: true
      })
      .subscribe({
        next: (userData: UserDataModel) => {
          this.userService.userProfileData.next(userData);
          this.websocketsService.connectPrivate(userData.userId);
        },
        error: (error) => {
          this.logout();
        }
      });
  }

  initializeTimers(): void {
    const now = Date.now();
    const accessTokenExpiry = parseInt(
      localStorage.getItem('accessTokenExpiry') || '0',
      10
    );
    const refreshTokenExpiry = parseInt(
      localStorage.getItem('refreshTokenExpiry') || '0',
      10
    );

    // Розрахунок залишкового часу
    const accessTokenRemaining = accessTokenExpiry - now;
    const refreshTokenRemaining = refreshTokenExpiry - now;

    if (accessTokenRemaining > 0) {
      this.accessTokenTimer = setTimeout(() => {
        this.refreshToken().subscribe();
      }, accessTokenRemaining);
    } else {
      // Якщо час закінчився, оновлюємо токен одразу
      this.refreshToken().subscribe();
    }

    if (refreshTokenRemaining > 0) {
      this.refreshTokenTimer = setTimeout(() => {
        this.logout();
      }, refreshTokenRemaining);
    } else {
      // Якщо refreshToken вже закінчився, виконуємо logout
      this.logout();
    }
  }
}
