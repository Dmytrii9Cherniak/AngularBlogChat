import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { VerificationService } from '../services/verification.service';

export const registerGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const verificationService: VerificationService = inject(VerificationService);

  if (
    verificationService.hasRegistrationData() &&
    verificationService.isTimerValid()
  ) {
    return true; // Дозволяє перехід
  }

  return router.createUrlTree(['/auth/register']);
};
