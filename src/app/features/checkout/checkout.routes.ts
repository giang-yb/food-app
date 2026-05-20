import { Routes } from '@angular/router';

export const checkoutRoutes: Routes = [
  {
    path: 'checkout',
    redirectTo: 'order',
    pathMatch: 'full'
  }
];