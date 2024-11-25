import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { firstValueFrom } from 'rxjs';

export function initializeApp(
  authService: AuthService,
  userService: UserService
): () => Promise<void> {
  return async (): Promise<void> => {
    try {
      const isAuthenticated = await firstValueFrom(
        authService.isAuthenticated$
      );

      if (isAuthenticated) {
        await firstValueFrom(userService.getUserData());
      }

      authService.scheduleTokenExpirationCheck();
    } catch (error) {
      authService.logout();
    }
  };
}
