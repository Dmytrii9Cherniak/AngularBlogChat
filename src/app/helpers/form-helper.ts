import { FormGroup, FormBuilder, Validators } from '@angular/forms';

export class FormHelper {
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  private passwordPattern =
    /^(?=.*[!@#$%^&*()_+}{":;'?/>.<,`~])(?=.*\d)[^\s]{8,}$/;
  public form: FormGroup;
  public formSubmitted: boolean = false;
  public serverErrors: { [key: string]: string } | null = null;

  constructor(private fb: FormBuilder) {}

  createLoginForm(): FormGroup {
    this.form = this.fb.group({
      nickname: ['dcheyrnak10@gmail.com', Validators.required],
      password: ['380984438849Sofia!', Validators.required]
    });
    return this.form;
  }

  createRegisterForm(): FormGroup {
    this.form = this.fb.group(
      {
        nickname: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(39)
          ]
        ],
        username: ['', [Validators.required, Validators.maxLength(57)]],
        email: [
          '',
          [Validators.required, Validators.pattern(this.emailPattern)]
        ],
        password: [
          '',
          [Validators.required, Validators.pattern(this.passwordPattern)]
        ],
        confirm_password: ['', Validators.required]
      },
      {
        validators: this.passwordMatchValidator('password', 'confirm_password')
      }
    );
    return this.form;
  }

  createRequestForgotPasswordForm(): FormGroup {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]]
    });
    return this.form;
  }

  createForgotPasswordForm(): FormGroup {
    this.form = this.fb.group(
      {
        code: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(6)
          ]
        ],
        password: [
          '',
          [Validators.required, Validators.pattern(this.passwordPattern)]
        ],
        confirm_password: ['', Validators.required]
      },
      {
        validators: this.passwordMatchValidator('password', 'confirm_password')
      }
    );
    return this.form;
  }

  createConfirmAccountForm(): FormGroup {
    this.form = this.fb.group({
      code: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)]
      ]
    });
    return this.form;
  }

  getClientErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    const errorMessages: { [key: string]: { [key: string]: string } } = {
      nickname: {
        required: 'Nickname or email is required.',
        minlength: 'Minimum length is 3 characters.',
        maxlength: 'Maximum length is 39 characters.'
      },
      username: {
        required: 'Username is required.',
        maxlength: 'Maximum length is 57 characters.'
      },
      email: {
        required: 'Email is required.',
        pattern: 'Invalid email format.'
      },
      password: {
        required: 'Password is required.',
        pattern:
          'Password must be at least 8 characters long and contain at least one special character and one digit.'
      },
      confirm_password: {
        required: 'Confirm password is required.',
        passwordMismatch: 'Passwords do not match.'
      },
      identifier: {
        required: 'Identifier is required.'
      },
      code: {
        required: 'Code is required.',
        minlength: 'Code must be 6 digits long.',
        maxlength: 'Code must be 6 digits long.'
      }
    };

    if (control && control.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return errorMessages[controlName]?.[errorKey] || null;
    }

    return null;
  }

  onInput(controlName: string): void {
    const control = this.form.get(controlName);
    if (control) {
      control.markAsTouched({ onlySelf: true });
      if (this.serverErrors && this.serverErrors[controlName]) {
        delete this.serverErrors[controlName];
      }
    }
  }

  hasClientError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(
      control?.invalid &&
      (control.dirty || control.touched || this.formSubmitted)
    );
  }

  private passwordMatchValidator(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.controls[password];
      const confirmPasswordControl = formGroup.controls[confirmPassword];

      if (
        confirmPasswordControl.errors &&
        !confirmPasswordControl.errors['passwordMismatch']
      ) {
        return null;
      }

      if (
        passwordControl.value &&
        confirmPasswordControl.value &&
        passwordControl.value !== confirmPasswordControl.value
      ) {
        confirmPasswordControl.setErrors({
          ...confirmPasswordControl.errors,
          passwordMismatch: true
        });
      } else {
        if (confirmPasswordControl.hasError('passwordMismatch')) {
          const { passwordMismatch, ...otherErrors } =
            confirmPasswordControl.errors || {};
          confirmPasswordControl.setErrors(
            Object.keys(otherErrors).length ? otherErrors : null
          );
        }
      }

      return null;
    };
  }
}
