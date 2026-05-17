import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.hasToken()) {
    router.navigate(['/login']);
    return of(false);
  }

  if (authService.isAdmin()) {
    return true;
  }

  return http.get<any>('http://127.0.0.1:8000/api/me').pipe(
    map((response) => {
      const user = response?.data ?? response?.user ?? response;

      if (user?.role === 'admin') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('role', 'admin');
        }

        return true;
      }

      router.navigate(['/home']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
