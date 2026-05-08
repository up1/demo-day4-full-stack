import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';

import { AuthService, LoginResponse } from '../core/services/auth';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let element: HTMLElement;
  let authLoginSpy: ReturnType<typeof vi.fn>;
  let routerNavigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    authLoginSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([{ path: 'dashboard', children: [] }]),
        { provide: AuthService, useValue: { login: authLoginSpy } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;

    const router = TestBed.inject(Router);
    routerNavigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  function setInputValue(selector: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submitForm(): void {
    const form = element.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
  }

  async function fillAndSubmit(email: string, password: string): Promise<void> {
    setInputValue('#email', email);
    setInputValue('#password', password);
    fixture.detectChanges();
    submitForm();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function getErrorText(id: string): string {
    return element.querySelector(`#${id}`)?.textContent?.trim() ?? '';
  }

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('TC001 - Valid login', () => {
    it('should call AuthService.login with the form value and navigate to /dashboard on success', async () => {
      const response: LoginResponse = { message: 'Login successful', token: 'jwt' };
      const subject = new Subject<LoginResponse>();
      authLoginSpy.mockReturnValue(subject.asObservable());

      await fillAndSubmit('user@example.com', 'password123');

      expect(authLoginSpy).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(component.isSubmitting()).toBe(true);

      subject.next(response);
      subject.complete();
      await fixture.whenStable();

      expect(routerNavigateSpy).toHaveBeenCalledWith(['/dashboard']);
      expect(component.isSubmitting()).toBe(false);
      expect(component.serverError()).toBeNull();
    });
  });

  describe('TC002 - Invalid email format', () => {
    it('should display "Please enter a valid email address." and not call AuthService', async () => {
      await fillAndSubmit('userexample.com', 'password123');

      expect(authLoginSpy).not.toHaveBeenCalled();
      expect(component.emailErrorMessage()).toBe('Please enter a valid email address.');
      expect(getErrorText('email-error')).toBe('Please enter a valid email address.');
    });

    it('should display the same message when email is empty', async () => {
      await fillAndSubmit('', 'password123');

      expect(authLoginSpy).not.toHaveBeenCalled();
      expect(component.emailErrorMessage()).toBe('Please enter a valid email address.');
    });
  });

  describe('TC003 - Short password', () => {
    it('should display "Password must be at least 8 characters." and not call AuthService', async () => {
      await fillAndSubmit('user@example.com', 'pass');

      expect(authLoginSpy).not.toHaveBeenCalled();
      expect(component.passwordErrorMessage()).toBe('Password must be at least 8 characters.');
      expect(getErrorText('password-error')).toBe('Password must be at least 8 characters.');
    });

    it('should display the same message when password is empty', async () => {
      await fillAndSubmit('user@example.com', '');

      expect(authLoginSpy).not.toHaveBeenCalled();
      expect(component.passwordErrorMessage()).toBe('Password must be at least 8 characters.');
    });
  });

  describe('TC004 - Incorrect credentials', () => {
    it('should display the server error message and not navigate', async () => {
      const error = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Invalid email or password' },
      });
      authLoginSpy.mockReturnValue(throwError(() => error));

      await fillAndSubmit('user@example.com', 'wrongpassword');

      expect(authLoginSpy).toHaveBeenCalledTimes(1);
      expect(routerNavigateSpy).not.toHaveBeenCalled();
      expect(component.isSubmitting()).toBe(false);
      expect(component.serverError()).toBe('Invalid email or password');

      const alert = element.querySelector('[role="alert"][aria-live="assertive"]');
      expect(alert?.textContent?.trim()).toBe('Invalid email or password');
    });

    it('should fall back to "Invalid email or password" when the error has no message', async () => {
      authLoginSpy.mockReturnValue(throwError(() => new Error('boom')));

      await fillAndSubmit('user@example.com', 'wrongpassword');

      expect(component.serverError()).toBe('Invalid email or password');
    });
  });

  describe('Password visibility toggle', () => {
    it('should toggle the password input type when clicked', () => {
      const passwordInput = element.querySelector<HTMLInputElement>('#password')!;
      const toggleButton = element.querySelector<HTMLButtonElement>(
        'button[aria-pressed]',
      )!;

      expect(passwordInput.type).toBe('password');
      expect(toggleButton.getAttribute('aria-pressed')).toBe('false');

      toggleButton.click();
      fixture.detectChanges();

      expect(passwordInput.type).toBe('text');
      expect(toggleButton.getAttribute('aria-pressed')).toBe('true');
    });
  });
});
