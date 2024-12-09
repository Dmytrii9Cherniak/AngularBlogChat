import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    // Отримуємо значення авторизації (асинхронно)
    const isAuthenticated = await firstValueFrom(authService.isAuthenticated$);

    // Якщо користувач залогінений і йде на сторінку логіну або реєстрації
    if (isAuthenticated && state.url.startsWith('/auth')) {
      return router.createUrlTree(['/blogs']); // Перенаправляємо на основну сторінку
    }

    // Якщо користувач не залогінений і намагається потрапити на захищений маршрут
    if (!isAuthenticated && !state.url.startsWith('/auth')) {
      return router.createUrlTree(['/auth/login']); // Перенаправляємо на сторінку логіну
    }

    // Дозволяємо доступ до маршруту
    return true;
  } catch (error) {
    console.error('Error in authGuard:', error);
    return router.createUrlTree(['/auth/login']); // У разі помилки перенаправляємо на логін
  }
};
