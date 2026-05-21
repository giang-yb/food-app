import { Routes } from '@angular/router';
import { homeRoutes } from './features/home/home.routes';
import { cartRoutes } from './features/cart/cart.routes';
import { productRoutes } from './features/product/product.routes';
import { categoryRoutes } from './features/category/category.routes';
import { searchRoutes } from './features/search/search.routes';
import { orderRoutes } from './features/order/order.routes';
import { checkoutRoutes } from './features/checkout/checkout.routes';
import { authRoutes } from './features/auth/auth.routes';

export const routes: Routes = [
  ...homeRoutes,
  ...cartRoutes,
  ...productRoutes,
  ...categoryRoutes,
  ...searchRoutes,
  ...orderRoutes,
  ...checkoutRoutes,
  ...authRoutes
];