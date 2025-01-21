import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = '';

      if (error.error instanceof ErrorEvent) {
        errorMsg = `Client Error: ${error.error.message}`;
        toastr.error(errorMsg, 'Client Error');
      } else {
        errorMsg = `Error Code: ${error.status}, Message: ${error.message}`;
        toastr.error(errorMsg, 'Server Error');
      }

      console.error(errorMsg);
      return throwError(() => new Error(errorMsg)); // Повертаємо помилку
    })
  );
};
