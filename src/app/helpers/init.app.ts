import { firstValueFrom } from 'rxjs';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { WebsocketsService } from '../services/websockets.service';
import { TabManagerService } from '../services/tab-manager.service';
import { v4 as uuidv4 } from 'uuid';

export function initializeApp(
  authService: AuthService,
  userService: UserService,
  tokenService: TokenService,
  websocketsService: WebsocketsService,
  tabManagerService: TabManagerService
): () => Promise<void> {
  return async () => {
    if (
      !tabManagerService ||
      typeof tabManagerService.isMainTab !== 'function'
    ) {
      throw new Error(
        'TabManagerService is not correctly injected or does not have isMainTab method'
      );
    }

    const sessionId = localStorage.getItem('sessionId') || uuidv4();
    localStorage.setItem('sessionId', sessionId);

    if (tabManagerService.isMainTab()) {
      websocketsService.connect(sessionId);
    }

    window.addEventListener('beforeunload', () => {
      if (tabManagerService.isLastTab()) {
        websocketsService.disconnect();
      }
    });

    const accessToken = tokenService.getAccessToken();

    if (accessToken && tokenService.hasValidAccessToken()) {
      authService.initializeTimers();
      authService.setAuthenticated(true);

      try {
        const userData = await firstValueFrom(userService.getUserData());
        userService.userProfileData.next(userData);
        websocketsService.updateConnection(userData.id);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    } else if (accessToken) {
      try {
        await firstValueFrom(authService.refreshToken());
        authService.initializeTimers();
        authService.setAuthenticated(true);

        const userData = await firstValueFrom(userService.getUserData());
        userService.userProfileData.next(userData);
        websocketsService.updateConnection(userData.id);
      } catch (error) {
        console.error('Error refreshing token or fetching user data:', error);
        authService.logout();
      }
    } else {
      authService.logout();
    }
  };
}
