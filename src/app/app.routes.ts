import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/auth-page.component').then((m) => m.AuthPageComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent)
  },
  {
    path: 'oauth-success',
    loadComponent: () => import('./features/auth/oauth-success.component').then((m) => m.OAuthSuccessComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

