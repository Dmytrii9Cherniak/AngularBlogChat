import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ForgotPasswordService } from '../services/forgot.password.timer.service';

export const resetPasswordGuardGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const forgotPasswordService = inject(ForgotPasswordService);

  const maxAttempts = 5;

  if (
    forgotPasswordService.hasForgotPasswordData() &&
    forgotPasswordService.isTimerValid() &&
    !forgotPasswordService.hasExceededMaxAttempts(maxAttempts)
  ) {
    return true;
  }

  forgotPasswordService.clearStorage();
  return router.createUrlTree(['/auth/request-reset-password']);
};
