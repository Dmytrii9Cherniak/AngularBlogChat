import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormHelper } from '../../../helpers/form-helper';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ForgotPasswordEmailConfirmModel } from '../../../models/forgot_password/forgot.password.email.confirm.model';
import { ForgotPasswordService } from '../../../services/forgot.password.timer.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-request-password-reset',
  templateUrl: './request-password-reset.component.html',
  styleUrl: './request-password-reset.component.scss',
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
export class RequestPasswordResetComponent implements OnInit {
  public formHelper: FormHelper;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private forgotPasswordService: ForgotPasswordService
  ) {
    this.formHelper = new FormHelper(this.fb);
  }

  ngOnInit(): void {
    this.formHelper.createRequestForgotPasswordForm();
  }

  sendRequestForResetPassword(): void {
    this.formHelper.formSubmitted = true;
    this.formHelper.serverErrors = null;

    if (this.formHelper.form.invalid) {
      return;
    }

    const { email } = new ForgotPasswordEmailConfirmModel(
      this.formHelper.form.value
    );

    this.authService.requestPasswordRecovery(email).subscribe({
      next: (): void => {
        localStorage.setItem('forgotPasswordData', JSON.stringify(email));
        const timerDuration = 3 * 60 * 1000;

        this.forgotPasswordService.createTimer(timerDuration);
        this.forgotPasswordService.resetAttempts();

        this.router.navigate(['auth/reset-password']);
      },
      error: (errorResponse): void => {
        if (errorResponse.error && errorResponse.error.errors) {
          this.formHelper.serverErrors = errorResponse.error.errors;
        }
      }
    });
  }

  public getClientErrorMessage(controlName: string): string | null {
    return this.formHelper.getClientErrorMessage(controlName);
  }

  public onInput(controlName: string): void {
    this.formHelper.onInput(controlName);
  }

  public getServerErrorMessage(controlName: string): string | null {
    return this.formHelper.serverErrors
      ? this.formHelper.serverErrors[controlName]
      : null;
  }
}
