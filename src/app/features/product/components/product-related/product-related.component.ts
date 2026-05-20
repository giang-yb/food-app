import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.models';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-product-related',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-related.component.html',
  styleUrl: './product-related.component.scss'
})
export class ProductRelatedComponent {
  @Input() products: Product[] = [];

  private cartService = inject(CartService);

  Math = Math;

  onAddToCart(event: Event, product: Product): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(product, 1);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  }

  get hasDiscount(): boolean {
    return !!(this.products.some(p => p.originalPrice && p.originalPrice! > p.price));
  }
}