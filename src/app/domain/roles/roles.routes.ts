import { Routes } from '@angular/router';
export const rolesRoutes: Routes = [
  {
    path: 'roles',
    canActivate: [],
    loadComponent() {
      return import('./pages/roles-page/roles-page.component').then(
        (m) => m.RolesPageComponent
      );
    },
  },
];
