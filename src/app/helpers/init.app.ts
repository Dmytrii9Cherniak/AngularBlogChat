import { firstValueFrom } from 'rxjs';
import { TokenService } from '../services/token.service';
import { UserProfileService } from '../services/user.profile.service';
import { AuthService } from '../services/auth.service';
import { WebsocketsService } from '../services/websockets.service';
import { v4 as uuidv4 } from 'uuid';
import { TranslateService } from '@ngx-translate/core';
import { ProjectsService } from '../services/projects.service';

export function initializeApp(
  authService: AuthService,
  userService: UserProfileService,
  tokenService: TokenService,
  projectsService: ProjectsService,
  websocketsService: WebsocketsService,
  translate: TranslateService
): () => Promise<void> {
  return async () => {
    const savedLang = localStorage.getItem('lang') || 'en';
    translate.setDefaultLang(savedLang);
    await firstValueFrom(translate.use(savedLang));

    // ✅ Один раз, цього достатньо
    projectsService.getAllProjects().subscribe({
      next: (projects) => console.log('Projects loaded:', projects),
      error: (error) => console.error('Error loading projects:', error)
    });

    const sessionId = localStorage.getItem('sessionId') || uuidv4();
    localStorage.setItem('sessionId', sessionId);

    const accessToken = tokenService.getAccessToken();

    try {
      if (accessToken && tokenService.hasValidAccessToken()) {
        authService.setAuthenticated(true);
      } else if (accessToken) {
        await firstValueFrom(authService.refreshToken());
        authService.setAuthenticated(true);
      } else {
        throw new Error('No valid access token');
      }

      const userData = await firstValueFrom(userService.getUserData());
      userService.userProfileData.next(userData);

      if (userData.id) {
        websocketsService.connect(accessToken);
      }
    } catch (error) {
      authService.logout();
    }

    window.addEventListener('beforeunload', () => {
      websocketsService.disconnect();
    });
  };
}
