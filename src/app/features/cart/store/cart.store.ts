import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, CartSummary } from '../models/cart.models';
import { Product } from '../../home/models/home.models';

const CART_STORAGE_KEY = 'food_app_cart';

@Injectable({
  providedIn: 'root'
})
export class CartStore {
  // State signals
  private items = signal<CartItem[]>(this.loadFromStorage());

  // Computed values
  totalItems = computed(() => {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  });

  totalPrice = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  });

  originalTotalPrice = computed(() => {
    return this.items().reduce((sum, item) => {
      const original = item.product.originalPrice || item.product.price;
      return sum + (original * item.quantity);
    }, 0);
  });

  savings = computed(() => {
    return this.originalTotalPrice() - this.totalPrice();
  });

  isEmpty = computed(() => this.items().length === 0);

  cartSummary = computed<CartSummary>(() => ({
    totalItems: this.totalItems(),
    totalPrice: this.totalPrice(),
    originalTotalPrice: this.originalTotalPrice(),
    savings: this.savings()
  }));

  constructor() {
    // Persist to localStorage on every change
    effect(() => {
      const currentItems = this.items();
      this.saveToStorage(currentItems);
    });
  }

  private loadFromStorage(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CartItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('[CartStore] Failed to save cart:', e);
    }
  }

  addItem(product: Product, quantity: number = 1): void {
    const currentItems = this.items();
    const existingIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingIndex >= 0) {
      // Update quantity if item exists
      const updated = [...currentItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity
      };
      this.items.set(updated);
    } else {
      // Add new item
      this.items.set([...currentItems, { product, quantity }]);
    }
  }

  removeItem(productId: string): void {
    const currentItems = this.items();
    this.items.set(currentItems.filter(item => item.product.id !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const currentItems = this.items();
    const existingIndex = currentItems.findIndex(item => item.product.id === productId);

    if (existingIndex >= 0) {
      const updated = [...currentItems];
      updated[existingIndex] = { ...updated[existingIndex], quantity };
      this.items.set(updated);
    }
  }

  incrementQuantity(productId: string): void {
    const currentItems = this.items();
    const item = currentItems.find(i => i.product.id === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity + 1);
    }
  }

  decrementQuantity(productId: string): void {
    const currentItems = this.items();
    const item = currentItems.find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      this.updateQuantity(productId, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      this.removeItem(productId);
    }
  }

  clearCart(): void {
    this.items.set([]);
  }

  getItems(): CartItem[] {
    return this.items();
  }

  getItemCount(): number {
    return this.totalItems();
  }
}