import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterModel } from '../models/register/register.model';
import { LoginModel } from '../models/login/login.model';
import { ConfirmCodeResponse } from '../models/confirm_account/confirm.code.response.model';
import { LoginResponseModel } from '../models/login/login.response.model';
import { RegisterResponseModel } from '../models/register/register.response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private httpClient: HttpClient) {}

  public login(body: LoginModel): Observable<LoginResponseModel> {
    return this.httpClient.post<LoginResponseModel>(
      `${environment.apiUrl}/auth/login`,
      body
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
      {
        code
      }
    );
  }

  public forgotPassword(email: string) {
    return this.httpClient.post(
      `${environment.apiUrl}/auth/forgot-password`,
      email
    );
  }

  public logout(): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/auth/logout`, {});
  }
}
