import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  // Встановити куку
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    ).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; secure; SameSite=Strict`;
  }

  // Отримати значення куки
  private getCookie(name: string): string | null {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  // Видалити куку
  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; SameSite=Strict`;
  }

  setAccessToken(token: string): void {
    this.setCookie(this.ACCESS_TOKEN_KEY, token, 1); // Токен зберігається на 1 день
  }

  getAccessToken(): string | null {
    return this.getCookie(this.ACCESS_TOKEN_KEY);
  }

  removeAccessToken(): void {
    this.deleteCookie(this.ACCESS_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    this.setCookie(this.REFRESH_TOKEN_KEY, token, 7); // Refresh токен зберігається на 7 днів
  }

  getRefreshToken(): string | null {
    return this.getCookie(this.REFRESH_TOKEN_KEY);
  }

  removeRefreshToken(): void {
    this.deleteCookie(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    } catch {
      return true;
    }
  }

  getTokenExpirationDate(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? new Date(payload.exp * 1000) : null;
    } catch {
      return null;
    }
  }

  hasValidAccessToken(): boolean {
    const token = this.getAccessToken();
    return token ? !this.isTokenExpired(token) : false;
  }
}
