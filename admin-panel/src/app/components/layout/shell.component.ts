import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="brand-icon">◈</span>
          <div>
            <div class="brand-name">Sharez</div>
            <div class="brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard"  [class.active]="isActive('/dashboard')"  class="nav-item">
            <span>📊</span> Dashboard
          </a>
          <a routerLink="/users"      [class.active]="isActive('/users')"      class="nav-item">
            <span>👥</span> Users
          </a>
          <a routerLink="/questions"  [class.active]="isActive('/questions')"  class="nav-item">
            <span>❓</span> Questions
          </a>
          <a routerLink="/answers"    [class.active]="isActive('/answers')"    class="nav-item">
            <span>💬</span> Answers
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="admin-info">
            <div class="admin-avatar">{{ (authService.currentUser$ | async)?.name?.[0]?.toUpperCase() }}</div>
            <div>
              <div class="admin-name">{{ (authService.currentUser$ | async)?.name }}</div>
              <div class="admin-role">Administrator</div>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">🚪 Logout</button>
        </div>
      </aside>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }

    .sidebar {
      width: 240px; flex-shrink: 0;
      background: var(--bg-card); border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      position: sticky; top: 0; height: 100vh;
    }

    .sidebar-brand {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1.5rem; border-bottom: 1px solid var(--border);
    }
    .brand-icon { font-size: 1.6rem; color: var(--accent); }
    .brand-name { font-family: var(--font-display); font-size: 1.1rem; color: var(--text-primary); font-weight: 700; }
    .brand-sub  { font-size: 0.72rem; color: var(--text-muted); }

    .sidebar-nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.2rem; }

    .nav-item {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.65rem 0.85rem; border-radius: 8px;
      font-size: 0.875rem; color: var(--text-secondary);
      text-decoration: none; transition: var(--transition);
    }
    .nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
    .nav-item.active { background: var(--accent-dim); color: var(--accent); font-weight: 500; }

    .sidebar-footer { padding: 1rem 0.75rem; border-top: 1px solid var(--border); }
    .admin-info { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem; }
    .admin-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: var(--accent); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; font-weight: 700; flex-shrink: 0;
    }
    .admin-name { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); }
    .admin-role { font-size: 0.72rem; color: var(--text-muted); }

    .logout-btn {
      width: 100%; padding: 0.5rem; border-radius: 8px;
      background: var(--red-dim); border: 1px solid rgba(229,72,77,0.2);
      color: var(--red); font-size: 0.82rem; cursor: pointer;
      transition: var(--transition);
    }
    .logout-btn:hover { background: var(--red); color: #fff; }

    .main-content { flex: 1; overflow-y: auto; background: var(--bg); }
  `]
})
export class ShellComponent {
  currentRoute = '';

  constructor(public authService: AuthService, private router: Router) {
    router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentRoute = e.url;
    });
  }

  isActive(path: string): boolean { return this.currentRoute.startsWith(path); }
  logout(): void { this.authService.logout(); this.router.navigate(['/login']); }
}
