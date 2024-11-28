import { firstValueFrom } from 'rxjs';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

export function initializeApp(
  authService: AuthService,
  userService: UserService,
  tokenService: TokenService
): () => Promise<void> {
  return async () => {
    const accessToken = tokenService.getAccessToken();

    if (accessToken && tokenService.hasValidAccessToken()) {
      // Токен є і він валідний
      authService.startRefreshTokenExpiryTimer();
      authService.setAuthenticated(true); // Оновлюємо стан авторизації

      try {
        // Отримуємо дані користувача
        const userData = await firstValueFrom(userService.getUserData());
        userService.userProfileData.next(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // authService.logout();
      }
    } else if (accessToken) {
      // Токен є, але він недійсний. Виконуємо refreshToken
      try {
        await firstValueFrom(authService.refreshToken());
        authService.startRefreshTokenExpiryTimer();
        authService.setAuthenticated(true); // Оновлюємо стан авторизації

        const userData = await firstValueFrom(userService.getUserData());
        userService.userProfileData.next(userData);
      } catch (error) {
        console.error('Error refreshing token or fetching user data:', error);
        authService.logout();
      }
    } else {
      // Токен відсутній, користувач не авторизований
      authService.logout();
    }
  };
}
