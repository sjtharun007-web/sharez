import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../models/models';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // Decode JWT and check expiry
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        if (res.success && res.user.role === 'admin') {
          localStorage.setItem('admin_token', res.token);
          localStorage.setItem('admin_user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Force logout on 401 — called by interceptor
  forceLogout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem('admin_token');
    // If token exists but expired, clean up and return null
    if (token && !this.isTokenValid(token)) {
      this.forceLogout();
      return null;
    }
    return token;
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('admin_token');
    const user  = this.currentUserSubject.value;
    return !!token && !!user && user.role === 'admin' && this.isTokenValid(token);
  }

  private getStoredUser(): User | null {
    try {
      const token = localStorage.getItem('admin_token');
      const raw   = localStorage.getItem('admin_user');

      // Validate token before restoring session
      if (!token || !raw) return null;
      if (!this.isTokenValid(token)) {
        // Expired — clear storage silently
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        return null;
      }

      return JSON.parse(raw);
    } catch {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      return null;
    }
  }
}
