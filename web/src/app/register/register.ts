import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../core/services/auth';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordsMatchValidator },
  );

  readonly isSubmitting = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly nameErrorMessage = computed(() => {
    if (!this.shouldShowError('name')) return null;
    const errors = this.form.controls.name.errors;
    if (!errors) return null;
    if (errors['required']) return 'Please enter your full name.';
    if (errors['minlength']) return 'Name must be at least 2 characters.';
    return null;
  });

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

  readonly confirmPasswordErrorMessage = computed(() => {
    const control = this.form.controls.confirmPassword;
    const showField = control.invalid && (control.touched || this.submitted());
    if (showField && control.errors?.['required']) {
      return 'Please confirm your password.';
    }
    const showMismatch =
      this.form.errors?.['passwordsMismatch'] &&
      (control.touched || this.submitted()) &&
      !control.errors?.['required'];
    if (showMismatch) {
      return 'Passwords do not match.';
    }
    return null;
  });

  readonly termsErrorMessage = computed(() => {
    if (!this.shouldShowError('terms')) return null;
    return 'You must accept the Terms of Service and Privacy Policy.';
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.auth.login({ email, password }).subscribe({
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

  private shouldShowError(field: 'name' | 'email' | 'password' | 'terms'): boolean {
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
    return 'Unable to create account. Please try again.';
  }
}
