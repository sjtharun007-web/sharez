import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">◈</div>
          <h1>Sharez Admin</h1>
          <p>Sign in to manage the platform</p>
        </div>

        <form (ngSubmit)="onSubmit()" autocomplete="off" #loginForm="ngForm">
          <div class="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              placeholder="admin@sharez.com"
              required
              class="input"
              [class.input-error]="error"
              autocomplete="off"
            />
          </div>
          <div class="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              [(ngModel)]="password"
              placeholder="••••••••"
              required
              class="input"
              [class.input-error]="error"
              autocomplete="new-password"
            />
          </div>

          <!-- Error message -->
          <div *ngIf="error" class="error-box">
            <span class="error-icon">⚠</span>
            <span>{{ error }}</span>
          </div>

          <!-- Success message -->
          <div *ngIf="successMsg" class="success-box">
            <span>✓ {{ successMsg }}</span>
          </div>

          <button type="submit" class="submit-btn" [disabled]="loading">
            <span *ngIf="loading" class="spinner"></span>
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <p class="login-hint">Admin access only</p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex;
      align-items: center; justify-content: center;
      background: var(--bg); padding: 1rem;
    }
    .login-card {
      width: 100%; max-width: 400px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 16px; padding: 2.5rem 2rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      animation: fadeUp 0.3s ease forwards;
    }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

    .login-header { text-align: center; margin-bottom: 2rem; }
    .login-logo { font-size: 2.5rem; color: var(--accent); margin-bottom: 0.5rem; }
    h1 { font-family: var(--font-display); font-size: 1.8rem; color: var(--text-primary); margin-bottom: 0.25rem; }
    p { font-size: 0.875rem; color: var(--text-muted); }

    form { display: flex; flex-direction: column; gap: 1rem; }

    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 0.82rem; font-weight: 500; color: var(--text-secondary); }

    .input {
      background: var(--bg); border: 1.5px solid var(--border);
      border-radius: 8px; padding: 0.7rem 1rem;
      color: var(--text-primary); font-size: 0.9rem;
      font-family: var(--font-body); transition: all 0.2s; width: 100%;
    }
    .input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
    .input::placeholder { color: var(--text-muted); }
    .input-error { border-color: var(--red) !important; }

    .error-box {
      display: flex; align-items: center; gap: 0.5rem;
      background: var(--red-dim); border: 1px solid rgba(229,72,77,0.35);
      border-radius: 8px; padding: 0.7rem 0.9rem;
      font-size: 0.875rem; color: var(--red);
      animation: fadeUp 0.2s ease forwards;
    }
    .error-icon { font-size: 1rem; flex-shrink: 0; }

    .success-box {
      background: var(--green-dim); border: 1px solid rgba(34,160,107,0.3);
      border-radius: 8px; padding: 0.7rem 0.9rem;
      font-size: 0.875rem; color: var(--green);
    }

    .submit-btn {
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.78rem; background: var(--accent); color: #fff;
      border: none; border-radius: 8px; font-size: 0.95rem;
      font-weight: 600; cursor: pointer; transition: all 0.2s;
      margin-top: 0.25rem; font-family: var(--font-body);
    }
    .submit-btn:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(91,76,245,0.3); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .login-hint { text-align: center; margin-top: 1.25rem; font-size: 0.78rem; color: var(--text-muted); }
  `]
})
export class LoginComponent {
  email      = '';
  password   = '';
  error      = '';
  successMsg = '';
  loading    = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    // Client-side validation first
    if (!this.email.trim()) {
      this.error = 'Email is required';
      return;
    }
    if (!this.password.trim()) {
      this.error = 'Password is required';
      return;
    }
    if (!this.email.includes('@')) {
      this.error = 'Please enter a valid email address';
      return;
    }

    this.loading    = true;
    this.error      = '';
    this.successMsg = '';

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: (res) => {
        if (res.user.role !== 'admin') {
          this.error   = 'Access denied. This panel is for administrators only.';
          this.loading = false;
          this.authService.logout();
          return;
        }
        this.successMsg = 'Login successful! Redirecting…';
        setTimeout(() => this.router.navigate(['/dashboard']), 800);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;

        // Handle different error scenarios
        if (!err.status || err.status === 0) {
          this.error = 'Cannot connect to server. Make sure the backend is running.';
        } else if (err.status === 401) {
          this.error = 'Invalid email or password. Please try again.';
        } else if (err.status === 400) {
          this.error = err.error?.message || 'Invalid input. Please check your details.';
        } else if (err.status === 403) {
          this.error = 'Access denied. Admin accounts only.';
        } else if (err.status === 500) {
          this.error = 'Server error. Please try again later.';
        } else {
          this.error = err.error?.message || 'Login failed. Please try again.';
        }
      }
    });
  }
}
