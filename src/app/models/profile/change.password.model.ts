export class ChangePasswordModel {
  current_password: string;
  new_password: string;
  confirm_password: string;

  constructor(
    current_password: string,
    new_password: string,
    confirm_password: string
  ) {
    this.current_password = current_password;
    this.new_password = new_password;
    this.confirm_password = confirm_password;
  }
}
