import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-answers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Answers</h1>
          <p class="page-sub">{{ filtered.length }} answers across all questions</p>
        </div>
        <input class="search-input" type="text" placeholder="Search answers…"
          [(ngModel)]="searchTerm" (input)="onSearch()" />
      </div>

      <div *ngIf="deleteTarget" class="confirm-banner">
        <p>Delete this answer by <strong>{{ getAuthorName(deleteTarget.userId) }}</strong>?</p>
        <div class="confirm-actions">
          <button class="btn-cancel" (click)="deleteTarget = null">Cancel</button>
          <button class="btn-confirm" (click)="confirmDelete()" [disabled]="deleting">
            {{ deleting ? 'Deleting…' : 'Yes, Delete' }}
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state"><span class="spinner"></span> Loading answers…</div>

      <div *ngIf="!loading" class="answers-list">
        <div *ngFor="let a of filtered" class="answer-card">
          <div class="answer-card-header">
            <div class="answer-meta">
              <div class="meta-avatar">{{ getAuthorName(a.userId)[0].toUpperCase() }}</div>
              <span class="meta-name">{{ getAuthorName(a.userId) }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-time">{{ formatDate(a.createdAt) }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-q">on: <em>{{ getQuestionTitle(a.questionId) }}</em></span>
            </div>
            <div class="answer-card-right">
              <span class="vote-info">
                👍 {{ a.helpfulCount }} &nbsp; 👎 {{ a.notHelpfulCount }}
              </span>
              <button class="btn-delete" (click)="requestDelete(a)">Delete</button>
            </div>
          </div>
          <p class="answer-content">{{ a.content | slice:0:200 }}{{ a.content.length > 200 ? '…' : '' }}</p>
        </div>
        <div *ngIf="filtered.length === 0" class="empty-state">No answers found.</div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .page-title { font-family: var(--font-display); font-size: 1.8rem; color: var(--text-primary); }
    .page-sub { font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem; }
    .search-input { background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 8px; padding: 0.6rem 1rem; color: var(--text-primary); font-size: 0.875rem; width: 260px; transition: var(--transition); outline: none; }
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

    .answers-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .answer-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; transition: var(--transition); }
    .answer-card:hover { border-color: var(--border-light); }

    .answer-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap; }

    .answer-meta { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-muted); flex-wrap: wrap; }
    .meta-avatar { width: 22px; height: 22px; border-radius: 50%; background: var(--accent-dim); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; }
    .meta-name { color: var(--text-secondary); font-weight: 600; }
    .meta-sep { color: var(--border-light); }
    .meta-q { color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .meta-q em { color: var(--accent); font-style: normal; }

    .answer-card-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
    .vote-info { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; }

    .answer-content { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }

    .btn-delete { padding: 0.35rem 0.75rem; border-radius: 6px; background: var(--red-dim); border: 1px solid rgba(229,72,77,0.25); color: var(--red); font-size: 0.8rem; cursor: pointer; transition: var(--transition); white-space: nowrap; }
    .btn-delete:hover { background: var(--red); color: #fff; }

    .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }
  `]
})
export class AnswersComponent implements OnInit {
  allAnswers: any[] = [];
  filtered: any[]   = [];
  questions: any[]  = [];
  searchTerm = '';
  loading = true;
  deleteTarget: any = null;
  deleting = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    // Load all questions first, then fetch answers for each
    this.adminService.getQuestions().subscribe({
      next: (res) => {
        this.questions = res.data;
        const requests = res.data.map(q => this.adminService.getAnswersForQuestion(q._id));

        if (requests.length === 0) { this.loading = false; return; }

        forkJoin(requests).subscribe({
          next: (results) => {
            this.allAnswers = results.flatMap(r => r.data);
            this.filtered   = [...this.allAnswers];
            this.loading    = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.allAnswers.filter(a =>
      a.content.toLowerCase().includes(t) ||
      this.getAuthorName(a.userId).toLowerCase().includes(t)
    );
  }

  requestDelete(a: any): void { this.deleteTarget = a; }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true;
    this.adminService.deleteAnswer(this.deleteTarget._id).subscribe({
      next: () => {
        this.allAnswers = this.allAnswers.filter(a => a._id !== this.deleteTarget._id);
        this.filtered   = this.filtered.filter(a => a._id !== this.deleteTarget._id);
        this.deleteTarget = null;
        this.deleting = false;
      },
      error: () => { this.deleting = false; }
    });
  }

  getAuthorName(userId: any): string {
    return typeof userId === 'object' ? userId?.name || 'Unknown' : 'Unknown';
  }

  getQuestionTitle(questionId: any): string {
    if (typeof questionId === 'object') return questionId?.title || '';
    const q = this.questions.find(q => q._id === questionId);
    return q ? q.title.substring(0, 50) + (q.title.length > 50 ? '…' : '') : '';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
