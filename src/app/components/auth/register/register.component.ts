import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { FormHelper } from '../../../helpers/form-helper';
import { VerificationService } from '../../../services/verification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
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
export class RegisterComponent implements OnInit {
  public formHelper: FormHelper;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private verificationService: VerificationService
  ) {
    this.formHelper = new FormHelper(this.fb);
  }

  ngOnInit(): void {
    this.formHelper.createRegisterForm();
  }

  public register(): void {
    this.formHelper.formSubmitted = true;
    this.formHelper.serverErrors = null;

    if (this.formHelper.form.invalid) {
      return;
    }

    const formValue = this.formHelper.form.value;
    this.authService.register(formValue).subscribe({
      next: (): void => {
        localStorage.setItem('registrationData', JSON.stringify(formValue));
        const timerDuration = 3 * 60 * 1000; // 3 хвилини

        this.verificationService.createTimer(timerDuration);
        this.verificationService.resetAttempts(); // Скидаємо кількість спроб

        this.router.navigate(['/auth/confirm-account']);
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
