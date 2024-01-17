import { Routes } from '@angular/router';
import { authRoutes } from './domain/auth/auth.routes';
import { authGuard } from './domain/auth/guards/auth.guard';
import { petRoutes } from './domain/pet/pet.routes';
import { rolesRoutes } from './domain/roles/roles.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'pets',
        pathMatch: 'full',
      },
      ...petRoutes,
      ...rolesRoutes,
    ],
  },
  ...authRoutes,
  {
    path: '**',
    redirectTo: 'home',
  },
];
