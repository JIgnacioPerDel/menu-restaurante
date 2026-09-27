import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  template: `
    @if (message()) {
      <p class="error" role="alert">{{ message() }}</p>
    }
  `,
  styles: `
    .error {
      margin: 0 0 1rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      background: var(--color-danger-bg);
      color: var(--color-danger);
    }
  `,
})
export class ErrorMessage {
  readonly message = input<string | null>(null);
}
