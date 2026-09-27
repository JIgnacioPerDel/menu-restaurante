import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Impide abrir el panel sin sesión. Es comodidad de UX: el backend rechaza igualmente las peticiones. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree(['/admin/login'], { queryParams: { redirect: state.url } });
};
