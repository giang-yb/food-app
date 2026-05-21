import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/home.models';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;

  private cartService = inject(CartService);
  isFavorite = signal(false);

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.isFavorite.set(!this.isFavorite());
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(this.product, 1);
    console.log('[ProductCard] Added to cart:', this.product.name);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  }

  get hasDiscount(): boolean {
    return !!(this.product.originalPrice && this.product.originalPrice > this.product.price);
  }

  get discountPercent(): number {
    if (!this.product.originalPrice) return 0;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }
}