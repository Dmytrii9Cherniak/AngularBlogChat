import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  let isAuthenticated = null;

  authService.isAuthenticated$.subscribe((value) => {
    isAuthenticated = value;
  });

  return isAuthenticated ? router.createUrlTree(['/blogs']) : true;
};
