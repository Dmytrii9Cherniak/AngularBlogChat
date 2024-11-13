import { FormGroup, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(
  password: string,
  confirmPassword: string
) {
  return (formGroup: FormGroup): ValidationErrors | null => {
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
