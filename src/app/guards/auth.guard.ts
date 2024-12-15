import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const isAuthenticated = await firstValueFrom(authService.isAuthenticated$);

    if (isAuthenticated && state.url.startsWith('/auth')) {
      return router.createUrlTree(['/blogs']);
    }

    if (!isAuthenticated && !state.url.startsWith('/auth')) {
      return router.createUrlTree(['/auth/login']);
    }

    return true;
  } catch (error) {
    console.error('Error in authGuard:', error);
    return router.createUrlTree(['/auth/login']);
  }
};
