export class ForgotPasswordModel {
  code: number;
  password: string;
  confirm_password: string;
  errors?: {
    [key: string]: string;
  };

  constructor(code: number, password: string, confirm_password: string) {
    this.code = code;
    this.password = password;
    this.confirm_password = confirm_password;
  }
}
