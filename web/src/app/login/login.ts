import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
})
export class LoginComponent {
  showPassword = signal(false);

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    // TODO: handle login logic
  }
}
