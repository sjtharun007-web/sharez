import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Question } from '../../models/models';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Questions</h1>
          <p class="page-sub">{{ filtered.length }} questions on the platform</p>
        </div>
        <div class="header-right">
          <div class="filter-tabs">
            <button [class.active]="statusFilter === 'all'"      (click)="setFilter('all')">All</button>
            <button [class.active]="statusFilter === 'unsolved'" (click)="setFilter('unsolved')">Unsolved</button>
            <button [class.active]="statusFilter === 'solved'"   (click)="setFilter('solved')">✓ Solved</button>
          </div>
          <input class="search-input" type="text" placeholder="Search…"
            [(ngModel)]="searchTerm" (input)="applyFilters()" />
        </div>
      </div>

      <div *ngIf="deleteTarget" class="confirm-banner">
        <p>Delete <strong>{{ deleteTarget.title }}</strong>? This removes all answers, votes and comments.</p>
        <div class="confirm-actions">
          <button class="btn-cancel" (click)="deleteTarget = null">Cancel</button>
          <button class="btn-confirm" (click)="confirmDelete()" [disabled]="deleting">
            {{ deleting ? 'Deleting…' : 'Yes, Delete' }}
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state"><span class="spinner"></span> Loading…</div>

      <div *ngIf="!loading" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Author</th>
              <th>Status</th>
              <th>Posted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let q of filtered; let i = index">
              <td class="idx-col">{{ i + 1 }}</td>
              <td class="q-col">
                <div class="q-title">{{ q.title }}</div>
                <div class="q-tags">
                  <span *ngFor="let tag of q.tags" class="q-tag">{{ tag }}</span>
                </div>
              </td>
              <td class="muted-col">{{ getAuthorName(q.userId) }}</td>
              <td>
                <span [class]="q.isSolved ? 'badge-solved' : 'badge-unsolved'">
                  {{ q.isSolved ? '✓ Solved' : 'Unsolved' }}
                </span>
              </td>
              <td class="muted-col">{{ formatDate(q.createdAt) }}</td>
              <td>
                <button class="btn-delete" (click)="requestDelete(q)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="6" class="empty-row">No questions found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .page-title { font-family: var(--font-display); font-size: 1.8rem; color: var(--text-primary); }
    .page-sub { font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem; }
    .header-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .filter-tabs { display: flex; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 0.2rem; gap: 0.1rem; }
    .filter-tabs button { padding: 0.35rem 0.85rem; border-radius: 6px; font-size: 0.8rem; font-weight: 500; background: none; border: none; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
    .filter-tabs button:hover { color: var(--text-primary); }
    .filter-tabs button.active { background: var(--accent); color: #fff; }
    .search-input { background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 8px; padding: 0.6rem 1rem; color: var(--text-primary); font-size: 0.875rem; width: 200px; transition: var(--transition); outline: none; }
    .search-input:focus { border-color: var(--accent); }
    .search-input::placeholder { color: var(--text-muted); }

    .confirm-banner { background: var(--red-dim); border: 1px solid rgba(229,72,77,0.3); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .confirm-banner p { font-size: 0.875rem; color: var(--text-primary); }
    .confirm-banner strong { color: var(--red); }
    .confirm-actions { display: flex; gap: 0.5rem; }
    .btn-cancel { padding: 0.45rem 0.9rem; border-radius: 6px; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); font-size: 0.82rem; cursor: pointer; }
    .btn-confirm { padding: 0.45rem 0.9rem; border-radius: 6px; background: var(--red); border: none; color: #fff; font-size: 0.82rem; cursor: pointer; }
    .btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

    .loading-state { display: flex; align-items: center; gap: 0.75rem; padding: 3rem; color: var(--text-muted); }
    .table-wrapper { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    thead tr { background: var(--bg); border-bottom: 1px solid var(--border); }
    th { padding: 0.75rem 1.25rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: var(--bg-hover); }
    td { padding: 0.85rem 1.25rem; font-size: 0.875rem; color: var(--text-primary); vertical-align: top; }
    .idx-col { color: var(--text-muted); font-size: 0.8rem; width: 40px; }
    .muted-col { color: var(--text-secondary); }
    .q-col { max-width: 320px; }
    .q-title { font-weight: 500; margin-bottom: 0.3rem; line-height: 1.4; }
    .q-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .q-tag { background: var(--accent-dim); color: var(--accent); font-size: 0.68rem; font-weight: 600; padding: 0.1rem 0.4rem; border-radius: 999px; }
    .badge-solved { font-size: 0.72rem; font-weight: 700; background: var(--green-dim); color: var(--green); padding: 0.2rem 0.6rem; border-radius: 999px; white-space: nowrap; }
    .badge-unsolved { font-size: 0.72rem; font-weight: 700; background: rgba(245,159,0,0.1); color: var(--yellow); padding: 0.2rem 0.6rem; border-radius: 999px; white-space: nowrap; }
    .btn-delete { padding: 0.35rem 0.75rem; border-radius: 6px; background: var(--red-dim); border: 1px solid rgba(229,72,77,0.25); color: var(--red); font-size: 0.8rem; cursor: pointer; transition: var(--transition); }
    .btn-delete:hover { background: var(--red); color: #fff; }
    .empty-row { text-align: center; padding: 2rem; color: var(--text-muted); }
  `]
})
export class QuestionsComponent implements OnInit {
  questions: Question[] = [];
  filtered: Question[] = [];
  searchTerm = '';
  statusFilter = 'all';
  loading = true;
  deleteTarget: Question | null = null;
  deleting = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getQuestions().subscribe({
      next: (res) => { this.questions = res.data; this.applyFilters(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  setFilter(f: string): void { this.statusFilter = f; this.applyFilters(); }

  applyFilters(): void {
    let result = this.questions;
    if (this.statusFilter === 'solved')   result = result.filter(q => q.isSolved);
    if (this.statusFilter === 'unsolved') result = result.filter(q => !q.isSolved);
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(q => q.title.toLowerCase().includes(t));
    }
    this.filtered = result;
  }

  requestDelete(q: Question): void { this.deleteTarget = q; }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true;
    this.adminService.deleteQuestion(this.deleteTarget._id).subscribe({
      next: () => {
        this.questions = this.questions.filter(q => q._id !== this.deleteTarget!._id);
        this.applyFilters();
        this.deleteTarget = null;
        this.deleting = false;
      },
      error: () => { this.deleting = false; }
    });
  }

  getAuthorName(userId: any): string {
    return typeof userId === 'object' ? userId?.name || 'Unknown' : 'Unknown';
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
