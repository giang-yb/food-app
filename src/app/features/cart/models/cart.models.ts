// Cart Data Models

import { Product } from '../../home/models/home.models';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  originalTotalPrice: number;
  savings: number;
}