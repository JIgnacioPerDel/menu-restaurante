import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Session {
  token: string;
  username: string;
  expiresAt: string;
}

const STORAGE_KEY = 'menu.admin-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<Session | null>(readSession());

  readonly username = computed(() => this.session()?.username ?? null);

  /** El token solo cuenta si no ha caducado. La seguridad real está en el backend. */
  isAuthenticated(): boolean {
    const session = this.session();
    return !!session && new Date(session.expiresAt).getTime() > Date.now();
  }

  token(): string | null {
    return this.isAuthenticated() ? this.session()!.token : null;
  }

  login(username: string, password: string): Observable<Session> {
    return this.http
      .post<Session>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((session) => {
          this.session.set(session);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
          } catch {
            // Sin almacenamiento la sesión dura lo que la pestaña
          }
        }),
      );
  }

  logout(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nada que limpiar
    }
    this.router.navigate(['/admin/login']);
  }
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
