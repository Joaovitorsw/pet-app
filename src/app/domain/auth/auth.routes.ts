import { Routes } from '@angular/router';
import { isLoggedGuard } from './guards/is-logged.guard';
export const authRoutes: Routes = [
  {
    path: 'sign-in',
    canActivate: [isLoggedGuard],
    loadComponent() {
      return import('./pages/sign-in/sign-in.component').then(
        (m) => m.SignInComponent
      );
    },
  },

  {
    path: 'sign-up',
    canActivate: [isLoggedGuard],
    loadComponent() {
      return import('./pages/sign-up/sign-up.component').then(
        (m) => m.SignUpComponent
      );
    },
  },
];
