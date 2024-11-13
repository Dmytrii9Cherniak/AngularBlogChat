import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { LoginModel } from '../../../models/login/login.model';
import { LoginResponseModel } from '../../../models/login/login.response.model';
import { FormHelper } from '../../../helpers/form-helper';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
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
export class LoginComponent implements OnInit {
  public formHelper: FormHelper;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.formHelper = new FormHelper(this.fb);
  }

  ngOnInit(): void {
    this.formHelper.createLoginForm();
  }

  public login(): void {
    this.formHelper.formSubmitted = true;
    this.formHelper.serverErrors = null;

    if (this.formHelper.form.invalid) {
      return;
    }

    const formValue: LoginModel = this.formHelper.form.value;
    this.authService.login(formValue).subscribe({
      next: (response: LoginResponseModel): void => {
        this.formHelper.serverErrors = null;
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

  public hasClientError(controlName: string): boolean {
    return this.formHelper.hasClientError(controlName);
  }

  public getServerErrorMessage(controlName: string): string | null {
    return this.formHelper.serverErrors
      ? this.formHelper.serverErrors[controlName]
      : null;
  }
}
