import { Routes } from '@angular/router';
export const petRoutes: Routes = [
  {
    path: 'pets',
    loadComponent() {
      return import('./pages/pet-page/pet-page.component').then(
        (m) => m.PetPageComponent
      );
    },
  },
];
