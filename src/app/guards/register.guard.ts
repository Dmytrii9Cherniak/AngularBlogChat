import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { VerificationService } from '../services/verification.service';

export const registerGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const verificationService: VerificationService = inject(VerificationService);

  const maxAttempts = 5;

  if (
    verificationService.hasRegistrationData() &&
    verificationService.isTimerValid() &&
    !verificationService.hasExceededMaxAttempts(maxAttempts)
  ) {
    return true;
  }

  verificationService.clearStorage();
  return router.createUrlTree(['/auth/register']);
};
