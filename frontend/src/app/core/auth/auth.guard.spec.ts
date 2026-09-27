import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/admin/pedidos' } as RouterStateSnapshot),
    );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('redirects to login when there is no session', () => {
    const result = runGuard() as UrlTree;

    expect(result instanceof UrlTree).toBe(true);
    expect(result.toString()).toBe('/admin/login?redirect=%2Fadmin%2Fpedidos');
  });

  it('redirects to login when the session has expired', () => {
    localStorage.setItem(
      'menu.admin-session',
      JSON.stringify({ token: 'x', username: 'admin', expiresAt: '2000-01-01T00:00:00Z' }),
    );

    expect(runGuard() instanceof UrlTree).toBe(true);
  });

  it('allows access with a valid session', () => {
    localStorage.setItem(
      'menu.admin-session',
      JSON.stringify({ token: 'x', username: 'admin', expiresAt: new Date(Date.now() + 60_000).toISOString() }),
    );

    expect(runGuard()).toBe(true);
  });
});
