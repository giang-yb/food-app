import { Routes } from '@angular/router';
import { CategoryPageComponent } from './pages/category-page/category-page.component';

export const categoryRoutes: Routes = [
  {
    path: 'category/:slug',
    component: CategoryPageComponent
  }
];