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
  // private broadcastChannel = new BroadcastChannel('auth-channel');
  // protected isAuthenticatedSubject = new BehaviorSubject<boolean>(
  //   this.tokenService.hasValidAccessToken()
  // );
  // public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // private isRefreshingToken = false; // Запобігання одночасним запитам
  // private tokenRefreshSubject = new BehaviorSubject<string | null>(null);
  //
  // private tokenExpirationSubscription: Subscription | null = null;
  // private refreshTokenExpiryTimer: Subscription | null = null;

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

  // login(
  //   body: LoginModel
  // ): Observable<{ access_token: string; user: UserDataModel }> {
  //   if (this.isAuthenticatedSubject.value) {
  //     throw new Error('User is already authenticated.');
  //   }
  //
  //   return this.httpClient
  //     .post<{ access_token: string }>(`${environment.apiUrl}/auth/login`, body)
  //     .pipe(
  //       switchMap((response) => {
  //         this.tokenService.setAccessToken(response.access_token);
  //         this.setAuthenticated(true);
  //
  //         this.clearAllTimers();
  //         this.scheduleTokenExpirationCheck();
  //
  //         const timerDuration = 50 * 1000; // Таймер розлогування через 50 секунд
  //         this.startRefreshTokenExpiryTimer(timerDuration);
  //
  //         return this.httpClient
  //           .get<UserDataModel>(`${environment.apiUrl}/profile/user-data`)
  //           .pipe(
  //             tap((userData) => {
  //               this.userService.userProfileData.next(userData);
  //             }),
  //             map((userData) => ({
  //               access_token: response.access_token,
  //               user: userData
  //             }))
  //           );
  //       })
  //     );
  // }
  //
  // logout(): void {
  //   this.tokenService.clearAllTokens();
  //   this.tokenExpirationSubscription?.unsubscribe();
  //   this.tokenService.clearTimerExpirationTime();
  //   this.isAuthenticatedSubject.next(false);
  //   this.clearAllTimers();
  // }
  //
  // refreshToken(): Observable<{ access_token: string }> {
  //   if (this.isRefreshingToken) {
  //     return this.tokenRefreshSubject.pipe(
  //       switchMap((token) => {
  //         if (!token) {
  //           return throwError(() => new Error('No token available.'));
  //         }
  //         return this.httpClient.post<{ access_token: string }>(
  //           `${environment.apiUrl}/auth/token/refresh`,
  //           {}
  //         );
  //       })
  //     );
  //   }
  //
  //   this.isRefreshingToken = true;
  //   this.tokenRefreshSubject.next(null);
  //
  //   return this.httpClient
  //     .post<{
  //       access_token: string;
  //     }>(`${environment.apiUrl}/auth/token/refresh`, {})
  //     .pipe(
  //       tap((response) => {
  //         this.tokenService.setAccessToken(response.access_token);
  //         this.tokenRefreshSubject.next(response.access_token);
  //         this.scheduleTokenExpirationCheck();
  //       }),
  //       catchError((error) => {
  //         console.error('Token refresh failed:', error);
  //         this.tokenRefreshSubject.next(null);
  //         this.logout();
  //         return throwError(() => error);
  //       }),
  //       finalize(() => {
  //         this.isRefreshingToken = false;
  //       })
  //     );
  // }
  //
  // scheduleTokenExpirationCheck(): void {
  //   const token = this.tokenService.getAccessToken();
  //   if (!token) return;
  //
  //   const expirationDate = this.tokenService.getTokenExpirationDate(token);
  //   if (!expirationDate) return;
  //
  //   const now = new Date().getTime();
  //   const delay = expirationDate.getTime() - now - 11000; // 11 секунд до закінчення
  //
  //   if (this.tokenExpirationSubscription) {
  //     this.tokenExpirationSubscription.unsubscribe();
  //   }
  //
  //   if (delay <= 0) {
  //     this.refreshToken().subscribe();
  //   } else {
  //     this.tokenExpirationSubscription = timer(delay).subscribe(() => {
  //       this.refreshToken().subscribe();
  //     });
  //   }
  // }
  //
  // startRefreshTokenExpiryTimer(duration: number): void {
  //   const expirationTime = Date.now() + duration;
  //
  //   if (duration <= 0) {
  //     console.error('Invalid timer duration. It must be greater than 0.');
  //     return;
  //   }
  //
  //   this.tokenService.setTimerExpirationTime(expirationTime);
  //
  //   this.clearRefreshTokenTimer();
  //
  //   this.refreshTokenExpiryTimer = timer(duration).subscribe({
  //     next: () => {
  //       this.logout();
  //     },
  //     error: (err) => {
  //       console.error('Error in refresh token timer subscription:', err);
  //     }
  //   });
  // }
  //
  // clearAllTimers(): void {
  //   if (this.tokenExpirationSubscription) {
  //     this.tokenExpirationSubscription.unsubscribe();
  //   }
  //   if (this.refreshTokenExpiryTimer) {
  //     this.refreshTokenExpiryTimer.unsubscribe();
  //   }
  // }
  //
  // public getAccessToken(): string | null {
  //   return this.tokenService.getAccessToken();
  // }
  //
  // public isAccessTokenExpired(token: string): boolean {
  //   return this.tokenService.isTokenExpired(token);
  // }
  //
  // public setAuthenticated(isAuthenticated: boolean): void {
  //   this.isAuthenticatedSubject.next(isAuthenticated);
  // }
  //
  // private clearRefreshTokenTimer(): void {
  //   if (this.refreshTokenExpiryTimer) {
  //     this.refreshTokenExpiryTimer.unsubscribe();
  //   }
  // }
  //
  // private handleLogoutSync(): void {
  //   this.isAuthenticatedSubject.next(false);
  //   this.clearAllTimers();
  // }
  //
  // private handleLoginSync(): void {
  //   if (this.tokenService.hasValidAccessToken()) {
  //     this.isAuthenticatedSubject.next(true);
  //     this.scheduleTokenExpirationCheck();
  //   }
  // }

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

  setAuthenticated(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  login(body: any): Observable<any> {
    if (this.isAuthenticatedSubject.value) {
      throw new Error('User is already logged in.');
    }

    return this.httpClient
      .post<{ access_token: string }>(
        `${environment.apiUrl}/auth/login`,
        body,
        {
          withCredentials: true
        }
      )
      .pipe(
        tap((response) => {
          this.tokenService.saveAccessToken(response.access_token);
          this.setAuthenticated(true);
          this.startRefreshTokenExpiryTimer();
          this.broadcastChannel.postMessage('login');
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

    // Оновлюємо access_token кожні 20 секунд
    this.accessTokenTimer = setInterval(() => {
      this.refreshToken().subscribe();
    }, 20000);

    // Logout через 50 секунд, якщо не оновлено refresh_token
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

  initialize(): void {
    const accessToken = this.tokenService.getAccessToken();

    if (accessToken) {
      if (!this.tokenService.isTokenFormatValid(accessToken)) {
        // Токен пошкоджений, виконуємо refreshToken
        this.refreshToken().subscribe({
          next: () => {
            this.startRefreshTokenExpiryTimer();
            this.setAuthenticated(true);
          },
          error: () => {
            this.logout();
          }
        });
      } else if (this.tokenService.hasValidAccessToken()) {
        // Токен валідний
        this.startRefreshTokenExpiryTimer();
        this.setAuthenticated(true);
      } else {
        // Токен недійсний, виконуємо refreshToken
        this.refreshToken().subscribe({
          next: () => {
            this.startRefreshTokenExpiryTimer();
            this.setAuthenticated(true);
          },
          error: () => {
            this.logout();
          }
        });
      }
    } else {
      this.logout();
    }
  }

  // private isRefreshingToken = false; // Запобігання одночасним запитам
  // private tokenRefreshSubject = new BehaviorSubject<string | null>(null);
  //
  // private tokenExpirationSubscription: Subscription | null = null;
  // private refreshTokenExpiryTimer: Subscription | null = null;
  //
  // login(
  //   body: LoginModel
  // ): Observable<{ access_token: string; user: UserDataModel }> {
  //   if (this.isAuthenticatedSubject.value) {
  //     throw new Error('User is already authenticated.');
  //   }
  //
  //   return this.httpClient
  //     .post<{ access_token: string }>(`${environment.apiUrl}/auth/login`, body)
  //     .pipe(
  //       switchMap((response) => {
  //         this.tokenService.setAccessToken(response.access_token);
  //         this.setAuthenticated(true);
  //
  //         this.clearAllTimers();
  //         this.scheduleTokenExpirationCheck();
  //
  //         this.startRefreshTokenExpiryTimer(50 * 1000); // 50 секунд для refresh token
  //
  //         return this.httpClient
  //           .get<UserDataModel>(`${environment.apiUrl}/profile/user-data`)
  //           .pipe(
  //             tap((userData) => {
  //               this.userService.userProfileData.next(userData);
  //             }),
  //             map((userData) => ({
  //               access_token: response.access_token,
  //               user: userData
  //             }))
  //           );
  //       }),
  //       catchError((error) => {
  //         console.error('Login failed:', error);
  //         this.logout(); // Розлогування у разі невдачі
  //         return throwError(() => error);
  //       })
  //     );
  // }
  //
  // logout(): void {
  //   this.tokenService.clearAllTokens();
  //   this.tokenExpirationSubscription?.unsubscribe();
  //   this.tokenService.clearTimerExpirationTime();
  //   this.isAuthenticatedSubject.next(false);
  //   this.clearAllTimers();
  // }
  //
  // refreshToken(): Observable<{ access_token: string }> {
  //   if (this.isRefreshingToken) {
  //     return this.tokenRefreshSubject.pipe(
  //       switchMap((token) => {
  //         if (!token) {
  //           return throwError(() => new Error('No token available.'));
  //         }
  //         return this.httpClient.post<{ access_token: string }>(
  //           `${environment.apiUrl}/auth/token/refresh`,
  //           {}
  //         );
  //       })
  //     );
  //   }
  //
  //   this.isRefreshingToken = true;
  //   this.tokenRefreshSubject.next(null);
  //
  //   return this.httpClient
  //     .post<{
  //       access_token: string;
  //     }>(`${environment.apiUrl}/auth/token/refresh`, {})
  //     .pipe(
  //       tap((response) => {
  //         this.tokenService.setAccessToken(response.access_token);
  //         this.tokenRefreshSubject.next(response.access_token);
  //         this.scheduleTokenExpirationCheck();
  //       }),
  //       catchError((error) => {
  //         console.error('Token refresh failed:', error);
  //         this.tokenRefreshSubject.next(null);
  //         this.logout();
  //         return throwError(() => error);
  //       }),
  //       finalize(() => {
  //         this.isRefreshingToken = false;
  //       })
  //     );
  // }
  //
  // scheduleTokenExpirationCheck(): void {
  //   const token = this.tokenService.getAccessToken();
  //   if (!token) return;
  //
  //   const expirationDate = this.tokenService.getTokenExpirationDate(token);
  //   if (!expirationDate) return;
  //
  //   const now = new Date().getTime();
  //   const delay = expirationDate.getTime() - now - 11000; // 11 секунд до закінчення
  //
  //   if (this.tokenExpirationSubscription) {
  //     this.tokenExpirationSubscription.unsubscribe();
  //   }
  //
  //   if (delay <= 0) {
  //     this.refreshToken().subscribe();
  //   } else {
  //     this.tokenExpirationSubscription = timer(delay).subscribe(() => {
  //       this.refreshToken().subscribe();
  //     });
  //   }
  // }
  //
  // startRefreshTokenExpiryTimer(duration: number): void {
  //   const expirationTime = Date.now() + duration;
  //
  //   if (duration <= 0) {
  //     console.error('Invalid timer duration. It must be greater than 0.');
  //     return;
  //   }
  //
  //   this.tokenService.setTimerExpirationTime(expirationTime);
  //
  //   this.clearRefreshTokenTimer();
  //
  //   this.refreshTokenExpiryTimer = timer(duration).subscribe({
  //     next: () => {
  //       this.logout();
  //     },
  //     error: (err) => {
  //       console.error('Error in refresh token timer subscription:', err);
  //     }
  //   });
  // }
  //
  // clearAllTimers(): void {
  //   if (this.tokenExpirationSubscription) {
  //     this.tokenExpirationSubscription.unsubscribe();
  //   }
  //   if (this.refreshTokenExpiryTimer) {
  //     this.refreshTokenExpiryTimer.unsubscribe();
  //   }
  // }
  //
  // public getAccessToken(): string | null {
  //   return this.tokenService.getAccessToken();
  // }
  //
  // public isAccessTokenExpired(token: string): boolean {
  //   return this.tokenService.isTokenExpired(token);
  // }
  //
  // public setAuthenticated(isAuthenticated: boolean): void {
  //   this.isAuthenticatedSubject.next(isAuthenticated);
  // }
  //
  // private clearRefreshTokenTimer(): void {
  //   if (this.refreshTokenExpiryTimer) {
  //     this.refreshTokenExpiryTimer.unsubscribe();
  //   }
  // }
  //
  // private handleLogoutSync(): void {
  //   this.isAuthenticatedSubject.next(false);
  //   this.clearAllTimers();
  // }
  //
  // private handleLoginSync(): void {
  //   if (this.tokenService.hasValidAccessToken()) {
  //     this.isAuthenticatedSubject.next(true);
  //     this.scheduleTokenExpirationCheck();
  //   }
  // }
  //
  // public isValidTokenFormat(token: string): boolean {
  //   return this.tokenService.isValidTokenFormat(token);
  // }
}
