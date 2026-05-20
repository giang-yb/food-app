import { Injectable, inject } from '@angular/core';
import { CartStore } from '../store/cart.store';
import { ToastService } from '../../../shared/services/toast.service';
import { Product } from '../../home/models/home.models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartStore = inject(CartStore);
  private toastService = inject(ToastService);

  addToCart(product: Product, quantity: number = 1): void {
    console.log('[CartService] Adding to cart:', product.name, 'qty:', quantity);
    this.cartStore.addItem(product, quantity);
    this.toastService.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  }

  removeFromCart(productId: string): void {
    console.log('[CartService] Removing from cart:', productId);
    this.cartStore.removeItem(productId);
  }

  updateQuantity(productId: string, quantity: number): void {
    this.cartStore.updateQuantity(productId, quantity);
  }

  incrementQuantity(productId: string): void {
    this.cartStore.incrementQuantity(productId);
  }

  decrementQuantity(productId: string): void {
    this.cartStore.decrementQuantity(productId);
  }

  clearCart(): void {
    this.cartStore.clearCart();
  }

  getCartItems() {
    return this.cartStore.getItems();
  }

  getCartSummary() {
    return this.cartStore.cartSummary;
  }

  getItemCount() {
    return this.cartStore.totalItems;
  }

  isCartEmpty() {
    return this.cartStore.isEmpty;
  }
}