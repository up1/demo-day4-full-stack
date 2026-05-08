import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

const API_HOST = 'http://localhost:8080';
const REQUEST_TIMEOUT_MS = 5000;
const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_HOST}/api/login`, payload)
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        retry({
          count: RETRY_COUNT,
          delay: (error: unknown, attempt: number) => {
            // Do not retry on 4xx client errors (e.g., invalid credentials)
            if (
              error instanceof HttpErrorResponse &&
              error.status >= 400 &&
              error.status < 500
            ) {
              return throwError(() => error);
            }
            return timer(RETRY_DELAY_MS * attempt);
          },
        }),
        catchError((error: unknown) => throwError(() => error)),
      );
  }
}
