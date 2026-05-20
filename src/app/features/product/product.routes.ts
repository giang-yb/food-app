import { Routes } from '@angular/router';

export const productRoutes: Routes = [
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(
        m => m.ProductDetailComponent
      )
  }
];