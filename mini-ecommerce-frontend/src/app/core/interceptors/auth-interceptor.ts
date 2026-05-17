import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = typeof localStorage === 'undefined'
    ? null
    : localStorage.getItem('token') || localStorage.getItem('auth_token');

  // Se tivermos um token, clonamos a requisição e adicionamos o cabeçalho
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
