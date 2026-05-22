import { Routes } from '@angular/router';
import { OrderPageComponent } from './pages/order-page/order-page.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';

export const orderRoutes: Routes = [
  {
    path: 'order',
    component: OrderPageComponent
  },
  {
    path: 'order/:id',
    component: OrderDetailComponent
  }
];