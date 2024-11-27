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
    const token = authService.getAccessToken();

    if (token && !authService.isAccessTokenExpired(token)) {
      authService.setAuthenticated(true);
      authService.scheduleTokenExpirationCheck();

      try {
        const userData = await firstValueFrom(userService.getUserData());
        userService.userProfileData.next(userData);
      } catch (error) {
        console.error('Failed to load user data. Logging out...');
      }
    }
  };
}
