import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.models';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-info.component.html',
  styleUrl: './product-info.component.scss'
})
export class ProductInfoComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  private cartService = inject(CartService);

  onAddToCart(): void {
    this.cartService.addToCart(this.product, 1);
    this.addToCart.emit(this.product);
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

  get ratingStars(): number[] {
    return Array(5).fill(0).map((_, i) => i);
  }

  get fullStars(): number {
    return Math.floor(this.product.rating);
  }

  get hasHalfStar(): boolean {
    return this.product.rating % 1 >= 0.5;
  }
}