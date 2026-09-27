import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/models/api-error';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, ErrorMessage],
  template: `
    <div class="login-wrapper">
      <form class="card login" [formGroup]="form" (ngSubmit)="submit()">
        <h1>Panel del restaurante</h1>
        <p class="muted">Acceso solo para el personal.</p>

        <app-error-message [message]="error()" />

        <label>
          Usuario
          <input formControlName="username" autocomplete="username" />
        </label>
        <label>
          Contraseña
          <input formControlName="password" type="password" autocomplete="current-password" />
        </label>

        <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
          {{ loading() ? 'Entrando…' : 'Entrar' }}
        </button>
        <a routerLink="/carta" class="back">← Volver a la carta</a>
      </form>
    </div>
  `,
  styles: `
    .login-wrapper {
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .login {
      display: grid;
      gap: 0.9rem;
      width: 100%;
      max-width: 380px;
    }
    h1 {
      margin: 0;
      font-size: 1.4rem;
    }
    p {
      margin: -0.5rem 0 0;
    }
    label {
      display: grid;
      gap: 0.3rem;
      font-weight: 500;
    }
    .back {
      font-size: 0.9rem;
      color: var(--color-muted);
      text-align: center;
    }
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Ruta a la que volver tras iniciar sesión (query param ?redirect=) */
  readonly redirect = input<string>();

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => {
        const target = this.redirect();
        this.router.navigateByUrl(target?.startsWith('/admin') ? target : '/admin');
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        this.error.set(err.message);
      },
    });
  }
}
