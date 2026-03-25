import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

// Guest guard — redirect to dashboard if already logged in
const guestGuard = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/shell.component').then(m => m.ShellComponent),
    canActivate: [AuthGuard],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'users',     loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent) },
      { path: 'questions', loadComponent: () => import('./components/questions/questions.component').then(m => m.QuestionsComponent) },
      { path: 'answers',   loadComponent: () => import('./components/answers/answers.component').then(m => m.AnswersComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
