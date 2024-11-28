import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private accessTokenKey = 'access_token';

  getAccessToken(): string | null {
    return this.getCookie(this.accessTokenKey);
  }

  saveAccessToken(token: string): void {
    const expirationDate = new Date(Date.now() + 30 * 1000); // 30 секунд
    document.cookie = `${this.accessTokenKey}=${token}; expires=${expirationDate.toUTCString()}; path=/;`;
  }

  clearTokens(): void {
    this.deleteCookie(this.accessTokenKey);
  }

  hasValidAccessToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Перевіряємо формат токену
    if (!this.isTokenFormatValid(token)) return false;

    // Перевіряємо, чи не минув термін дії токену
    return !this.isTokenExpired(token);
  }

  isTokenFormatValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Перевіряємо, чи можна розпакувати payload
      return !!payload && typeof payload.exp === 'number'; // Токен повинен містити поле `exp`
    } catch (error) {
      return false; // Якщо токен некоректний, повертаємо false
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      // Якщо токен пошкоджений, вважаємо його недійсним
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
