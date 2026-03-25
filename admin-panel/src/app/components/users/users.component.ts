import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { User } from '../../models/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Students</h1>
          <p class="page-sub">{{ filtered.length }} registered students</p>
        </div>
        <input class="search-input" type="text" placeholder="Search by name or email…"
          [(ngModel)]="searchTerm" (input)="onSearch()" />
      </div>

      <!-- Confirm delete -->
      <div *ngIf="deleteTarget" class="confirm-banner">
        <p>Delete <strong>{{ deleteTarget.name }}</strong>? This will remove all their questions, answers and data.</p>
        <div class="confirm-actions">
          <button class="btn-cancel" (click)="deleteTarget = null">Cancel</button>
          <button class="btn-confirm" (click)="confirmDelete()" [disabled]="deleting">
            {{ deleting ? 'Deleting…' : 'Yes, Delete' }}
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <span class="spinner"></span> Loading users…
      </div>

      <div *ngIf="!loading" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filtered; let i = index">
              <td class="idx-col">{{ i + 1 }}</td>
              <td>
                <div class="user-cell">
                  <div class="cell-avatar">{{ user.name[0].toUpperCase() }}</div>
                  <span class="cell-name">{{ user.name }}</span>
                </div>
              </td>
              <td class="muted-col">{{ user.email }}</td>
              <td class="muted-col">{{ formatDate(user.createdAt) }}</td>
              <td>
                <button class="btn-delete" (click)="requestDelete(user)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="5" class="empty-row">No students found.</td>
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
    .search-input {
      background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 8px;
      padding: 0.6rem 1rem; color: var(--text-primary); font-size: 0.875rem; width: 260px; transition: var(--transition);
    }
    .search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
    .search-input::placeholder { color: var(--text-muted); }

    .confirm-banner {
      background: var(--red-dim); border: 1px solid rgba(229,72,77,0.3);
      border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.25rem;
      display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
    }
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
    td { padding: 0.85rem 1.25rem; font-size: 0.875rem; color: var(--text-primary); }
    .idx-col { color: var(--text-muted); font-size: 0.8rem; width: 40px; }
    .muted-col { color: var(--text-secondary); }
    .user-cell { display: flex; align-items: center; gap: 0.6rem; }
    .cell-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--accent-dim); color: var(--accent);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
    }
    .cell-name { font-weight: 500; }
    .btn-delete { padding: 0.35rem 0.75rem; border-radius: 6px; background: var(--red-dim); border: 1px solid rgba(229,72,77,0.25); color: var(--red); font-size: 0.8rem; cursor: pointer; transition: var(--transition); }
    .btn-delete:hover { background: var(--red); color: #fff; }
    .empty-row { text-align: center; padding: 2rem; color: var(--text-muted); }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filtered: User[] = [];
  searchTerm = '';
  loading = true;
  deleteTarget: User | null = null;
  deleting = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getUsers().subscribe({
      next: (res) => { this.users = res.data; this.filtered = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.users.filter(u => u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
  }

  requestDelete(user: User): void { this.deleteTarget = user; }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true;
    this.adminService.deleteUser(this.deleteTarget._id).subscribe({
      next: () => {
        this.users    = this.users.filter(u => u._id !== this.deleteTarget!._id);
        this.filtered = this.filtered.filter(u => u._id !== this.deleteTarget!._id);
        this.deleteTarget = null;
        this.deleting = false;
      },
      error: () => { this.deleting = false; }
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
