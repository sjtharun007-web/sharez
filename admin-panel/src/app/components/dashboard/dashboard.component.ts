import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-sub">Platform overview</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <span class="spinner"></span> Loading stats…
      </div>

      <ng-container *ngIf="!loading">
        <!-- Stats grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">Students</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">❓</div>
            <div class="stat-value">{{ stats.totalQuestions }}</div>
            <div class="stat-label">Questions</div>
          </div>
          <div class="stat-card green-card">
            <div class="stat-icon">✓</div>
            <div class="stat-value">{{ stats.solvedQuestions }}</div>
            <div class="stat-label">Solved</div>
          </div>
          <div class="stat-card yellow-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-value">{{ stats.unsolvedQuestions }}</div>
            <div class="stat-label">Unsolved</div>
          </div>
          <div class="stat-card accent-card">
            <div class="stat-icon">💬</div>
            <div class="stat-value">{{ stats.totalAnswers }}</div>
            <div class="stat-label">Answers</div>
          </div>
        </div>

        <!-- Quick links -->
        <div class="quick-links">
          <h2 class="section-title">Quick Actions</h2>
          <div class="links-grid">
            <a routerLink="/users" class="link-card">
              <span class="link-icon">👥</span>
              <div>
                <div class="link-title">Manage Users</div>
                <div class="link-desc">View and delete student accounts</div>
              </div>
            </a>
            <a routerLink="/questions" class="link-card">
              <span class="link-icon">❓</span>
              <div>
                <div class="link-title">Manage Questions</div>
                <div class="link-desc">View and remove questions</div>
              </div>
            </a>
            <a routerLink="/answers" class="link-card">
              <span class="link-icon">💬</span>
              <div>
                <div class="link-title">Manage Answers</div>
                <div class="link-desc">Review and remove answers</div>
              </div>
            </a>
          </div>
        </div>

        <!-- Recent questions -->
        <div class="recent-section">
          <h2 class="section-title">Recent Questions</h2>
          <div class="recent-list">
            <div *ngFor="let q of recentQuestions" class="recent-item">
              <div class="recent-left">
                <div class="recent-title">{{ q.title }}</div>
                <div class="recent-meta">
                  by {{ getAuthorName(q.userId) }} · {{ formatDate(q.createdAt) }}
                  <span *ngFor="let tag of q.tags" class="recent-tag">{{ tag }}</span>
                </div>
              </div>
              <span [class]="q.isSolved ? 'badge-solved' : 'badge-unsolved'">
                {{ q.isSolved ? '✓ Solved' : 'Unsolved' }}
              </span>
            </div>
            <div *ngIf="recentQuestions.length === 0" class="empty-msg">No questions yet.</div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-family: var(--font-display); font-size: 1.8rem; color: var(--text-primary); }
    .page-sub { font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem; }
    .loading-state { display: flex; align-items: center; gap: 0.75rem; padding: 3rem; color: var(--text-muted); }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2.5rem; }
    .stat-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 12px; padding: 1.5rem; text-align: center; transition: var(--transition);
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
    .stat-icon { font-size: 1.75rem; margin-bottom: 0.6rem; }
    .stat-value { font-size: 2rem; font-weight: 700; color: var(--text-primary); line-height: 1; margin-bottom: 0.3rem; }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); }
    .green-card  { border-color: rgba(34,160,107,0.3); background: rgba(34,160,107,0.04); }
    .green-card  .stat-value { color: var(--green); }
    .yellow-card { border-color: rgba(245,159,0,0.3); background: rgba(245,159,0,0.04); }
    .yellow-card .stat-value { color: var(--yellow); }
    .accent-card { border-color: rgba(91,76,245,0.3); background: var(--accent-dim); }
    .accent-card .stat-value { color: var(--accent); }

    .section-title { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem; }

    .quick-links { margin-bottom: 2.5rem; }
    .links-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .link-card {
      display: flex; align-items: center; gap: 1rem;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 12px; padding: 1.25rem; transition: var(--transition); text-decoration: none;
    }
    .link-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow); }
    .link-icon { font-size: 1.5rem; flex-shrink: 0; }
    .link-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.2rem; }
    .link-desc  { font-size: 0.78rem; color: var(--text-muted); }

    .recent-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .recent-item {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 10px; padding: 0.9rem 1.2rem; transition: var(--transition);
    }
    .recent-item:hover { border-color: var(--border-light); }
    .recent-title { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); margin-bottom: 0.25rem; }
    .recent-meta { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
    .recent-tag {
      background: var(--accent-dim); color: var(--accent);
      padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.68rem; font-weight: 600;
    }
    .badge-solved {
      font-size: 0.72rem; font-weight: 700; white-space: nowrap;
      background: var(--green-dim); color: var(--green);
      padding: 0.2rem 0.6rem; border-radius: 999px; flex-shrink: 0;
    }
    .badge-unsolved {
      font-size: 0.72rem; font-weight: 700; white-space: nowrap;
      background: rgba(245,159,0,0.1); color: var(--yellow);
      padding: 0.2rem 0.6rem; border-radius: 999px; flex-shrink: 0;
    }
    .empty-msg { text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.875rem; }
  `]
})
export class DashboardComponent implements OnInit {
  stats = { totalUsers: 0, totalQuestions: 0, totalAnswers: 0, solvedQuestions: 0, unsolvedQuestions: 0 };
  recentQuestions: any[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    forkJoin({
      users:     this.adminService.getUsers(),
      questions: this.adminService.getQuestions()
    }).subscribe({
      next: ({ users, questions }) => {
        this.stats.totalUsers        = users.data.length;
        this.stats.totalQuestions    = questions.data.length;
        this.stats.solvedQuestions   = questions.data.filter(q => q.isSolved).length;
        this.stats.unsolvedQuestions = questions.data.filter(q => !q.isSolved).length;
        this.recentQuestions         = questions.data.slice(0, 6);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getAuthorName(userId: any): string {
    return typeof userId === 'object' ? userId?.name || 'Unknown' : 'Unknown';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
