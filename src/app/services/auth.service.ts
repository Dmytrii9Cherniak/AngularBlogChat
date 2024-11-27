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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private broadcastChannel = new BroadcastChannel('auth-channel');
  protected isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.tokenService.hasValidAccessToken()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private tokenExpirationSubscription: Subscription | null = null;
  private refreshTokenExpiryTimer: Subscription | null = null;

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

  login(
    body: LoginModel
  ): Observable<{ access_token: string; user: UserDataModel }> {
    if (this.isAuthenticatedSubject.value) {
      throw new Error('User is already authenticated.');
    }

    return this.httpClient
      .post<{ access_token: string }>(`${environment.apiUrl}/auth/login`, body)
      .pipe(
        switchMap((response) => {
          // Зберігаємо токен і налаштовуємо статус автентифікації
          this.tokenService.setAccessToken(response.access_token);
          this.setAuthenticated(true);

          // Чистимо всі таймери і налаштовуємо нові
          this.clearAllTimers();
          this.scheduleTokenExpirationCheck();

          const timerDuration = 50 * 1000; // Таймер розлогування через 50 секунд
          this.startRefreshTokenExpiryTimer(timerDuration);

          return this.httpClient
            .get<UserDataModel>(`${environment.apiUrl}/profile/user-data`)
            .pipe(
              tap((userData) => {
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

  logout(): void {
    this.tokenService.clearAllTokens();
    this.tokenService.clearTimerExpirationTime();
    this.isAuthenticatedSubject.next(false);
    this.clearAllTimers();
  }
  //
  refreshToken(): Observable<{ access_token: string }> {
    return this.httpClient
      .post<{
        access_token: string;
      }>(`${environment.apiUrl}/auth/token/refresh`, {})
      .pipe(
        tap((response) => {
          this.tokenService.setAccessToken(response.access_token);
        }),
        catchError((error) => {
          console.error('Refresh token failed. Logging out...');
          this.logout();
          return throwError(() => error);
        })
      );
  }

  private refreshTokenAndReschedule(): void {
    this.refreshToken().subscribe({
      next: (response) => {
        this.tokenService.setAccessToken(response.access_token);
        this.scheduleTokenExpirationCheck(); // Перезапуск перевірки
      },
      error: () => {
        console.error('Failed to refresh token. Logging out...');
        this.logout();
      }
    });
  }

  scheduleTokenExpirationCheck(): void {
    const token = this.tokenService.getAccessToken();
    if (!token) {
      console.warn('No token available for expiration check.');
      return;
    }

    const expirationDate = this.tokenService.getTokenExpirationDate(token);
    if (!expirationDate) {
      console.warn('Cannot determine token expiration date.');
      return;
    }

    const now = Date.now();
    const delay = expirationDate.getTime() - now - 11000; // 11 секунд до закінчення

    // Чистимо попередній таймер
    if (this.tokenExpirationSubscription) {
      this.tokenExpirationSubscription.unsubscribe();
    }

    if (delay <= 0) {
      console.warn('Token already expired. Refreshing immediately...');
      this.refreshTokenAndReschedule();
      return;
    }

    this.tokenExpirationSubscription = timer(delay).subscribe(() => {
      this.refreshTokenAndReschedule();
    });
  }

  startRefreshTokenExpiryTimer(duration: number): void {
    const expirationTime = Date.now() + duration;
    this.tokenService.setTimerExpirationTime(expirationTime); // Зберігаємо час завершення

    this.clearRefreshTokenTimer(); // Очищаємо попередній таймер

    this.refreshTokenExpiryTimer = timer(duration).subscribe({
      next: () => {
        this.logout(); // Виконуємо логаут після завершення таймера
      },
      error: (err) => {}
    });
  }

  public getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  public isAccessTokenExpired(token: string): boolean {
    return this.tokenService.isTokenExpired(token);
  }

  public setAuthenticated(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  private clearAllTimers(): void {
    if (this.tokenExpirationSubscription) {
      this.tokenExpirationSubscription.unsubscribe();
    }
    if (this.refreshTokenExpiryTimer) {
      this.refreshTokenExpiryTimer.unsubscribe();
    }
  }

  private clearRefreshTokenTimer(): void {
    if (this.refreshTokenExpiryTimer) {
      this.refreshTokenExpiryTimer.unsubscribe();
    }
  }

  private handleLogoutSync(): void {
    this.isAuthenticatedSubject.next(false);
    this.clearAllTimers();
  }

  private handleLoginSync(): void {
    if (this.tokenService.hasValidAccessToken()) {
      this.isAuthenticatedSubject.next(true);
      this.scheduleTokenExpirationCheck();
    }
  }
}
