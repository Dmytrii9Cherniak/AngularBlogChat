import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ForgotPasswordModel } from '../../../models/forgot_password/forgot.password.model';
import { FormHelper } from '../../../helpers/form-helper';
import { ForgotPasswordService } from '../../../services/forgot.password.timer.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  animations: [
    trigger('routeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ]),
      transition(':leave', [
        animate(
          '300ms ease-out',
          style({ opacity: 0, transform: 'translateY(-20px)' })
        )
      ])
    ])
  ]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  public formHelper: FormHelper;
  public timeLeft: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private forgotPasswordService: ForgotPasswordService
  ) {
    this.formHelper = new FormHelper(this.fb);
  }

  ngOnInit(): void {
    this.formHelper.createForgotPasswordForm();

    const savedEndTime = this.forgotPasswordService.getSavedTimer();
    if (savedEndTime) {
      const remainingTime = savedEndTime - Date.now();

      if (remainingTime > 0) {
        this.forgotPasswordService.startTimer(remainingTime, () => {
          this.router.navigate(['/auth/request-reset-password']);
        });
      } else {
        this.router.navigate(['/auth/request-reset-password']);
      }
    } else {
      this.router.navigate(['/auth/request-reset-password']);
    }

    this.forgotPasswordService.timer$.subscribe((time) => {
      this.timeLeft = time;
    });
  }

  confirmCodeChanged(event: string): void {
    this.formHelper.form.controls['code'].setValue(event);
    this.formHelper.form.controls['code'].updateValueAndValidity();

    if (this.formHelper.serverErrors && this.formHelper.serverErrors['code']) {
      delete this.formHelper.serverErrors['code'];
    }
  }

  onCodeCompleted(event: string): void {
    this.formHelper.form.controls['code'].setValue(event);
    this.formHelper.form.controls['code'].updateValueAndValidity();
  }

  onSubmit(): void {
    this.formHelper.formSubmitted = true;
    this.formHelper.serverErrors = null;

    if (this.formHelper.form.invalid) {
      return;
    }

    const { code, password, confirm_password } = this.formHelper.form.value;
    const resetPasswordValue = new ForgotPasswordModel(
      code,
      password,
      confirm_password
    );

    this.authService.resetAccountPassword(resetPasswordValue).subscribe({
      next: (): void => {
        this.forgotPasswordService.clearStorage();
        this.router.navigate(['/auth/login']);
      },
      error: (errorResponse): void => {
        if (this.forgotPasswordService.hasExceededMaxAttempts(5)) {
          this.forgotPasswordService.clearStorage();
          this.router.navigate(['/auth/request-reset-password']);
        } else {
          this.forgotPasswordService.incrementAttempts();
        }

        if (errorResponse.error && errorResponse.error.errors) {
          this.formHelper.serverErrors = {
            code: errorResponse.error.errors.message || 'An error occurred'
          };
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.forgotPasswordService.stopTimer();
  }

  public getClientErrorMessage(controlName: string): string | null {
    return this.formHelper.getClientErrorMessage(controlName);
  }

  public getServerErrorMessage(controlName: string): string | null {
    return this.formHelper.serverErrors
      ? this.formHelper.serverErrors[controlName] || null
      : null;
  }
}
