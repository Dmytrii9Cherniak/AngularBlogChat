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

    // Синхронізація вкладок через BroadcastChannel
    broadcastChannelService.onMessage((message) => {
      const { type, data } = message;
      if (type === 'login') {
        websocketsService.connectPrivate(data.userId);
      } else if (type === 'logout') {
        websocketsService.disconnect();
      }
    });

    // Перевірка токена
    const accessToken = tokenService.getAccessToken();
    if (accessToken && tokenService.hasValidAccessToken()) {
      authService.initializeTimers();
      authService.setAuthenticated(true);

      try {
        const userData = await firstValueFrom(userService.getUserData());
        userService.userProfileData.next(userData);

        // Підключення приватного WebSocket для авторизованого користувача
        websocketsService.connectPrivate(userData.userId);
        broadcastChannelService.postMessage('login', { userId: userData.userId });
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

        // Підключення приватного WebSocket
        websocketsService.connectPrivate(userData.userId);
        broadcastChannelService.postMessage('login', { userId: userData.userId });
      } catch (error) {
        console.error('Error refreshing token or fetching user data:', error);
        authService.logout();
      }
    } else {
      authService.logout();
    }

    // Очистка WebSocket при закритті вкладки
    window.addEventListener('beforeunload', () => {
      websocketsService.disconnect();
    });
  };
}
