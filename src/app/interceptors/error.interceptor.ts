import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = '';

      // Перевірка типу помилки
      if (error.error instanceof ErrorEvent) {
        // Клієнтська помилка
        errorMsg = `Client Error: ${error.error.message}`;
        toastr.error(errorMsg, 'Client Error');
      } else {
        // Серверна помилка
        errorMsg = `Error Code: ${error.status}, Message: ${error.message}`;
        toastr.error(errorMsg, 'Server Error');
      }

      console.error(errorMsg); // Логування помилки у консоль
      return throwError(() => new Error(errorMsg)); // Повертаємо помилку
    })
  );
};
