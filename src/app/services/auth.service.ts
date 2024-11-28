import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  timer,
  Observable,
  Subscription,
  tap,
  throwError,
  catchError,
  switchMap,
  map,
  finalize
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
import { LoginResponseModel } from '../models/login/login.response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private broadcastChannel = new BroadcastChannel('auth-channel');
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private accessTokenTimer: any;
  private refreshTokenTimer: any;

  constructor(
    private httpClient: HttpClient,
    private tokenService: TokenService,
    private userService: UserService
  ) {
    this.broadcastChannel.onmessage = (event) => {
      if (event.data === 'logout') {
        this.handleLogoutSync();
      } else if (event.data === 'login') {
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

  login(body: any): Observable<{ access_token: string; user: UserDataModel }> {
    if (this.isAuthenticatedSubject.value) {
      throw new Error('User is already logged in.');
    }

    return this.httpClient
      .post<{
        access_token: string;
      }>(`${environment.apiUrl}/auth/login`, body, { withCredentials: true })
      .pipe(
        switchMap((response) => {
          // Зберігаємо access_token
          this.tokenService.saveAccessToken(response.access_token);

          // Встановлюємо стан авторизації
          this.setAuthenticated(true);

          // Очищаємо всі таймери і запускаємо нові
          this.clearTimers();
          this.startRefreshTokenExpiryTimer();

          // Синхронізація між вкладками
          this.broadcastChannel.postMessage('login');

          // Виконуємо запит на отримання даних користувача
          return this.httpClient
            .get<UserDataModel>(`${environment.apiUrl}/profile/user-data`, {
              withCredentials: true
            })
            .pipe(
              tap((userData) => {
                // Зберігаємо дані користувача в UserService
                this.userService.userProfileData.next(userData);
              }),
              map((userData) => ({
                access_token: response.access_token,
                user: userData
              }))
            );
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
    this.setAuthenticated(false);
    this.tokenService.clearTokens();
    this.clearTimers();
    this.broadcastChannel.postMessage('logout');
  }

  startRefreshTokenExpiryTimer(): void {
    this.clearTimers();

    // Розрахунок часу завершення таймерів
    const now = Date.now();
    const accessTokenExpiry = now + 20000; // 20 секунд для access_token
    const refreshTokenExpiry = now + 50000; // 50 секунд для refresh_token

    // Зберігаємо час завершення у localStorage
    localStorage.setItem('accessTokenExpiry', accessTokenExpiry.toString());
    localStorage.setItem('refreshTokenExpiry', refreshTokenExpiry.toString());

    // Запускаємо таймери
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
    this.logout();
  }

  private handleLoginSync(): void {
    this.startRefreshTokenExpiryTimer();
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
