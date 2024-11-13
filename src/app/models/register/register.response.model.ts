export interface RegisterResponseModel {
  message: string;
  errors?: {
    [key: string]: string;
  };
}
