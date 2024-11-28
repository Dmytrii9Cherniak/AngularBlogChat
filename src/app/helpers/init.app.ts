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
      authService.initializeTimers(); // Відновлюємо таймери
      authService.setAuthenticated(true);

      try {
        const userData = await firstValueFrom(userService.getUserData());
        userService.userProfileData.next(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    } else if (accessToken) {
      try {
        await firstValueFrom(authService.refreshToken());
        authService.initializeTimers(); // Відновлюємо таймери
        authService.setAuthenticated(true);

        const userData = await firstValueFrom(userService.getUserData());
        userService.userProfileData.next(userData);
      } catch (error) {
        console.error('Error refreshing token or fetching user data:', error);
        authService.logout();
      }
    } else {
      authService.logout();
    }
  };
}
