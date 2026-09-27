import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ApiError } from '../models/api-error';

/** Añade el JWT a las peticiones del panel y cierra la sesión si el backend la rechaza. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/admin/')) {
    return next(req);
  }
  const auth = inject(AuthService);
  const token = auth.token();
  const authorized = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authorized).pipe(
    catchError((error: ApiError) => {
      if (error.status === 401) {
        auth.logout();
      }
      return throwError(() => error);
    }),
  );
};
