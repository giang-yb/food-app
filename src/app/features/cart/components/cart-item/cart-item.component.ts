import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartItem } from '../../models/cart.models';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss'
})
export class CartItemComponent {
  @Input() item!: CartItem;

  private cartService = inject(CartService);

  onIncrement(): void {
    this.cartService.incrementQuantity(this.item.product.id);
  }

  onDecrement(): void {
    this.cartService.decrementQuantity(this.item.product.id);
  }

  onRemove(): void {
    this.cartService.removeFromCart(this.item.product.id);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  }

  get subtotal(): number {
    return this.item.product.price * this.item.quantity;
  }

  get hasDiscount(): boolean {
    return !!(this.item.product.originalPrice && this.item.product.originalPrice > this.item.product.price);
  }
}