import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../../cart/store/cart.store';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.scss'
})
export class OrderPageComponent {
  private cartStore = inject(CartStore);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  customerName = '';
  customerPhone = '';
  deliveryAddress = '';

  get cartItems() {
    return this.cartStore.getItems();
  }

  get cartSummary() {
    return this.cartStore.cartSummary();
  }

  get isEmpty(): boolean {
    return this.cartStore.isEmpty();
  }

  onPlaceOrder(): void {
    if (!this.customerName.trim() || !this.customerPhone.trim() || !this.deliveryAddress.trim()) {
      this.toastService.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const order = this.orderService.createOrder(this.cartItems, {
      name: this.customerName,
      phone: this.customerPhone,
      address: this.deliveryAddress
    });

    this.cartStore.clearCart();
    this.toastService.success('Đặt hàng thành công! Mã đơn: ' + order.id);
    this.router.navigate(['/order', order.id]);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  }
}