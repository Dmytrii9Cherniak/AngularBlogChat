import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';

  setAccessToken(token: string): void {
    document.cookie = `${this.ACCESS_TOKEN_KEY}=${token}; path=/; Secure; SameSite=Strict`;
  }

  getAccessToken(): string | null {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === this.ACCESS_TOKEN_KEY) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  removeAccessToken(): void {
    document.cookie = `${this.ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict`;
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
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

  clearAllTokens(): void {
    this.removeAccessToken();
  }

  private readonly TIMER_KEY = 'timerExpirationTime';

  setTimerExpirationTime(expirationTime: number): void {
    const date = new Date(expirationTime).toUTCString();
    document.cookie = `${this.TIMER_KEY}=${date}; path=/; Secure; SameSite=Strict`;
  }

  getTimerExpirationTime(): number | null {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === this.TIMER_KEY) {
        const parsedTime = Date.parse(decodeURIComponent(value));
        if (!isNaN(parsedTime)) {
          return parsedTime;
        }
      }
    }
    return null;
  }

  clearTimerExpirationTime(): void {
    document.cookie = `${this.TIMER_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict`;
  }

  isValidTokenFormat(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Token format is invalid. Expected 3 parts.');
      return false;
    }

    try {
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) {
        console.warn('Token payload does not contain expiration time.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to parse token payload:', error);
      return false;
    }
  }
}
