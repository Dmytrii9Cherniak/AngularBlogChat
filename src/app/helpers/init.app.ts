import { firstValueFrom } from 'rxjs';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { WebsocketsService } from '../services/websockets.service';
import { BroadcastChannelService } from '../services/broadcast-channel.service';
import { v4 as uuidv4 } from 'uuid';

export function initializeApp(
  authService: AuthService,
  userService: UserService,
  tokenService: TokenService,
  websocketsService: WebsocketsService,
  broadcastChannelService: BroadcastChannelService
): () => Promise<void> {
  return async () => {
    const sessionId = localStorage.getItem('sessionId') || uuidv4();
    localStorage.setItem('sessionId', sessionId);

    broadcastChannelService.onMessage((message) => {
      const { type, data } = message;
      if (type === 'login') {
        if (data?.userId) {
          websocketsService.connect(data.userId);
        }
      } else if (type === 'logout') {
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

        if (userData.id) {
          websocketsService.connect(userData.id);
          broadcastChannelService.postMessage('login', {
            id: userData.id
          });
        }
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

        if (userData.id) {
          websocketsService.connect(userData.id);
          broadcastChannelService.postMessage('login', {
            id: userData.id
          });
        }
      } catch (error) {
        console.error('Error refreshing token or fetching user data:', error);
        authService.logout();
      }
    } else {
      authService.logout();
    }

    window.addEventListener('beforeunload', () => {
      websocketsService.disconnect();
    });
  };
}
