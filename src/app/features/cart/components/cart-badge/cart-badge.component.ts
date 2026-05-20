import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartStore } from '../../store/cart.store';

@Component({
  selector: 'app-cart-badge',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-badge.component.html',
  styleUrl: './cart-badge.component.scss'
})
export class CartBadgeComponent {
  private cartStore = inject(CartStore);

  get itemCount() {
    return this.cartStore.totalItems();
  }

  get showBadge() {
    return this.itemCount > 0;
  }
}