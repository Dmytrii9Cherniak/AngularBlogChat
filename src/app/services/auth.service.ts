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
import { UserProfileService } from './user.profile.service';
import { Router } from '@angular/router';
import { WebsocketsService } from './websockets.service';
import { ChatService } from './chat.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private tokenService: TokenService,
    private userService: UserProfileService,
    private router: Router,
    private websocketsService: WebsocketsService,
    private chatService: ChatService,
    private toastrService: ToastrService
  ) {}

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
          this.chatService.listenForChatList();

          return this.httpClient
            .get<UserDataModel>(`${environment.apiUrl}/auth/user-data`, {
              withCredentials: true
            })
            .pipe(
              tap((userData) => {
                this.userService.userProfileData.next(userData);
                this.toastrService.success(
                  `Ласкаво просимо в систему, ${userData.username}`
                );
                if (userData.id) {
                  this.websocketsService.connect(userData.id);
                }

                this.chatService.initializeChatList();
              }),
              map((userData) => ({
                access_token: response.access_token,
                user: userData
              }))
            );
        }),
        catchError((error) => {
          console.error('Login failed:', error.message || error);
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

    this.httpClient.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      next: () => {
        this.setAuthenticated(false);
        this.tokenService.clearTokens();
        this.websocketsService.disconnect();
        this.router.navigate(['/blogs']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      }
    });
  }
}
