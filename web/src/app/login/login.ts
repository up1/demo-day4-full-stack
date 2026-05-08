import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly showPassword = signal(false);
  readonly isSubmitting = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly emailErrorMessage = computed(() => {
    if (!this.shouldShowError('email')) return null;
    const errors = this.form.controls.email.errors;
    if (!errors) return null;
    if (errors['required'] || errors['email']) {
      return 'Please enter a valid email address.';
    }
    return null;
  });

  readonly passwordErrorMessage = computed(() => {
    if (!this.shouldShowError('password')) return null;
    const errors = this.form.controls.password.errors;
    if (!errors) return null;
    if (errors['required'] || errors['minlength']) {
      return 'Password must be at least 8 characters.';
    }
    return null;
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);
        this.serverError.set(this.resolveErrorMessage(error));
      },
    });
  }

  private shouldShowError(field: 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = (error.error as { message?: string } | null)?.message;
      if (message) return message;
      if (error.status === 0) {
        return 'Unable to reach the server. Please try again.';
      }
    }
    return 'Invalid email or password';
  }
}
