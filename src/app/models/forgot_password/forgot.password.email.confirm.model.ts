export class ForgotPasswordEmailConfirmModel {
  email: string;
  errors?: {
    [key: string]: string;
  };

  constructor(email: string) {
    this.email = email;
  }
}
