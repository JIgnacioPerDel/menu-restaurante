import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem(
      'menu.admin-session',
      JSON.stringify({ token: 'jwt-123', username: 'admin', expiresAt: new Date(Date.now() + 60_000).toISOString() }),
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    localStorage.clear();
  });

  it('adds the token to admin requests', () => {
    http.get('/api/admin/orders').subscribe();

    const req = controller.expectOne('/api/admin/orders');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-123');
    req.flush([]);
  });

  it('never sends the token to public endpoints', () => {
    http.get('/api/public/menu').subscribe();

    const req = controller.expectOne('/api/public/menu');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});
