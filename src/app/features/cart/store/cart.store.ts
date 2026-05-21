import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { CartItem, CartSummary } from '../models/cart.models';
import { Product } from '../../home/models/home.models';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartStore {
  private authService = inject(AuthService);

  // Dynamic storage key based on user
  private storageKey = computed(() => {
    const user = this.authService.user();
    return user ? `food_app_cart_${user.id}` : 'food_app_cart_guest';
  });

  // State signals
  private items = signal<CartItem[]>([]);

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
    // When storage key changes (user logs in/out), load cart for that specific user/guest
    effect(() => {
      const key = this.storageKey();
      const loadedItems = this.loadFromStorage(key);
      this.items.set(loadedItems);
    }, { allowSignalWrites: true });

    // Persist to localStorage whenever items change
    effect(() => {
      const currentItems = this.items();
      const key = this.storageKey();
      this.saveToStorage(key, currentItems);
    });
  }

  private loadFromStorage(key: string): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(key: string, items: CartItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(items));
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