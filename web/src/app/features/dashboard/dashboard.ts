import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex min-h-screen items-center justify-center p-lg">
      <div class="text-center">
        <h1 class="font-h1 text-h1 text-primary">Dashboard</h1>
        <p class="font-body-md text-body-md text-secondary mt-sm">
          Welcome! You are logged in.
        </p>
      </div>
    </main>
  `,
})
export class DashboardComponent {}
