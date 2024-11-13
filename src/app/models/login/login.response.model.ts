export interface LoginResponseModel {
  refresh_token?: string;
  access_token?: string;
  errors?: {
    [key: string]: string;
  };
}
