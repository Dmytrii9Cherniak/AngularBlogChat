import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { FormHelper } from '../../../helpers/form-helper';
import { VerificationService } from '../../../services/verification.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
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
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  public formHelper: FormHelper;
  public codeSent: boolean = false;
  public codeVerified: boolean = false;
  public timeLeft: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private verificationService: VerificationService
  ) {
    this.formHelper = new FormHelper(this.fb);
  }

  ngOnInit(): void {
    this.formHelper.createForgotPasswordForm();

    const savedEndTime = this.verificationService.getSavedTimer();
    if (savedEndTime) {
      this.verificationService.startTimer(savedEndTime - Date.now(), () => {
        this.codeSent = false;
      });
    }

    this.verificationService.timer$.subscribe((time) => (this.timeLeft = time));
  }

  ngOnDestroy(): void {
    this.verificationService.stopTimer();
  }

  sendCode(): void {
    this.formHelper.formSubmitted = true;
    if (this.formHelper.form.valid) {
      this.codeSent = true;
      this.verificationService.startTimer(3 * 60 * 1000, () => {
        this.codeSent = false;
      });
      // Додати логіку для відправки коду
    }
  }

  public onSubmit(): void {
    this.formHelper.formSubmitted = true;
    if (this.formHelper.form.invalid || !this.codeVerified) {
      return;
    }
    console.log('Submitting new password...');
    this.router.navigate(['/auth/login']);
  }
}
