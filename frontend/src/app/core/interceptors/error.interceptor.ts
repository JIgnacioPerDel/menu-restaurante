import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/api-error';

/** Convierte cualquier error HTTP en un ApiError homogéneo. */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error ?? {};
      const apiError: ApiError = {
        status: error.status,
        message:
          body.detail ??
          (error.status === 0 ? 'No se puede conectar con el servidor' : 'Error inesperado'),
        fieldErrors: body.errors ?? {},
      };
      return throwError(() => apiError);
    }),
  );
