import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { TokenService } from '../services/token.service';
import { firstValueFrom } from 'rxjs';

export function initializeApp(
  authService: AuthService,
  userService: UserService,
  tokenService: TokenService
): () => Promise<void> {
  return async (): Promise<void> => {
    try {
      const refreshToken = tokenService.getRefreshToken();

      if (refreshToken && !tokenService.hasValidAccessToken()) {
        await firstValueFrom(authService.refreshToken());
      }

      if (tokenService.hasValidAccessToken()) {
        await firstValueFrom(userService.getUserData());
        authService.scheduleTokenExpirationCheck();
      } else {
        authService.logout();
      }
    } catch (error) {
      console.error('Initialization error:', error);
      authService.logout();
    }
  };
}
