import { Component, OnInit, OnDestroy } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { FormHelper } from '../../../helpers/form-helper';
import { FormBuilder } from '@angular/forms';
import { VerificationService } from '../../../services/verification.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-confirm-account',
  templateUrl: './confirm-account.component.html',
  styleUrls: ['./confirm-account.component.scss'],
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
export class ConfirmAccountComponent implements OnInit, OnDestroy {
  public formHelper: FormHelper;
  public timeLeft: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private verificationService: VerificationService
  ) {
    this.formHelper = new FormHelper(this.fb);
  }

  ngOnInit(): void {
    this.formHelper.createConfirmAccountForm();

    const savedEndTime = this.verificationService.getSavedTimer();

    if (savedEndTime) {
      const remainingTime = savedEndTime - Date.now();

      if (remainingTime > 0) {
        this.verificationService.startTimer(remainingTime, () => {
          this.router.navigate(['/auth/register']);
        });
      } else {
        this.router.navigate(['/auth/register']);
      }
    } else {
      this.router.navigate(['/auth/register']);
    }

    this.verificationService.timer$.subscribe((time) => {
      this.timeLeft = time;
    });
  }

  ngOnDestroy(): void {
    this.verificationService.stopTimer();
  }

  onCodeCompleted(event: string): void {
    this.formHelper.form.controls['code'].setValue(event);
  }

  public confirmMyAccount(): void {
    this.formHelper.formSubmitted = true;
    if (this.formHelper.form.invalid) {
      return;
    }

    const code: number = Number(this.formHelper.form.controls['code'].value);

    this.authService.confirmAccount(code).subscribe({
      next: (response): void => {
        this.verificationService.clearStorage();
        this.router.navigate(['/auth/login']);
      },
      error: (errorResponse): void => {
        if (this.verificationService.hasExceededMaxAttempts(5)) {
          this.verificationService.clearStorage();
          this.router.navigate(['/auth/register']);
        } else {
          this.verificationService.incrementAttempts();
        }

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
    this.formHelper.serverErrors = null;
  }

  public getServerErrorMessage(controlName: string): string | null {
    return this.formHelper.serverErrors
      ? this.formHelper.serverErrors[controlName] ||
          this.formHelper.serverErrors['message']
      : null;
  }
}
