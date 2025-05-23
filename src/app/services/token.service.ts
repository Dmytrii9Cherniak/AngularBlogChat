import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refreshToken';

  getAccessToken(): string | null {
    return this.getCookie(this.accessTokenKey);
  }

  saveAccessToken(token: string | undefined): void {
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    document.cookie = `${this.accessTokenKey}=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
  }

  clearTokens(): void {
    this.deleteCookie(this.accessTokenKey);
    this.deleteCookie(this.refreshTokenKey);
  }

  hasValidAccessToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    if (!this.isTokenFormatValid(token)) return false;

    return !this.isTokenExpired(token);
  }

  isTokenFormatValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return !!payload && typeof payload.exp === 'number';
    } catch (error) {
      return false;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}
