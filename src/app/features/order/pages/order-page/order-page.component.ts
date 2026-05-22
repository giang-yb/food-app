import { Component, inject, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartStore } from '../../../cart/store/cart.store';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ProductDbService } from '../../../../core/services/product-db.service';
import { supabase } from '../../../../core/supabase/supabase.client';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.scss'
})
export class OrderPageComponent implements OnInit, OnDestroy {
  private cartStore = inject(CartStore);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private ngZone = inject(NgZone);

  checkoutForm = this.fb.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    customerPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
    deliveryAddress: ['', [Validators.required, Validators.minLength(10)]]
  });

  get f() {
    return this.checkoutForm.controls;
  }

  isShowingQR = false;
  isPlacingOrder = false;
  createdOrderId: string | null = null;
  createdOrderCode: string | null = null;
  dynamicQrUrl: string | null = null;
  countdown = 15 * 60; // 15 phút
  private timer: any;
  private realTimeChannel: any;

  get cartItems() {
    return this.cartStore.getItems();
  }

  get cartSummary() {
    return this.cartStore.cartSummary();
  }

  get isEmpty(): boolean {
    return this.cartStore.isEmpty();
  }

  get formattedCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  ngOnInit() {
    // Không cần load QR tĩnh tại ngOnInit nữa vì ta sẽ tạo QR động kèm Order ID khi đặt hàng
  }

  ngOnDestroy() {
    this.stopTimer();
    this.unsubscribeFromOrderUpdates();
  }

  async onPlaceOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toastService.error('Vui lòng điền đầy đủ và đúng định dạng thông tin giao hàng');
      return;
    }

    this.isPlacingOrder = true;
    try {
      const { customerName, customerPhone, deliveryAddress } = this.checkoutForm.value;
      
      // 1. Tạo đơn hàng thực tế lưu vào Supabase
      const order = await this.orderService.createOrder(this.cartItems, {
        name: customerName!,
        phone: customerPhone!,
        address: deliveryAddress!
      });

      this.createdOrderId = order.id;
      this.createdOrderCode = order.orderCode;

      // 2. Tạo đường link VietQR động chứa mã đơn hàng
      const bankId = 'OCB';
      const accountNo = 'SEPTG62559';
      const accountName = encodeURIComponent('DINH TRUONG GIANG');
      const amount = order.totalPrice;
      const addInfo = order.orderCode; // SePay dùng memo này để đối soát
      
      this.dynamicQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;

      // 3. Hiển thị Modal QR và bắt đầu đếm ngược
      this.isShowingQR = true;
      this.startTimer();

      // 4. Kích hoạt lắng nghe Real-time trạng thái đơn hàng
      this.subscribeToOrderUpdates(order.id);

      this.toastService.success('Đơn hàng đã được khởi tạo. Vui lòng quét mã QR thanh toán!');

    } catch (error: any) {
      this.toastService.error(error.message || 'Lỗi khi đặt hàng. Vui lòng thử lại.');
    } finally {
      this.isPlacingOrder = false;
    }
  }

  startTimer() {
    this.countdown = 15 * 60;
    this.stopTimer();
    this.timer = setInterval(() => {
      this.countdown--;

      // Khởi động cơ chế Polling dự phòng mỗi 5 giây
      if (this.countdown % 5 === 0) {
        this.pollOrderStatus();
      }

      if (this.countdown <= 0) {
        this.stopTimer();
        this.isShowingQR = false;
        this.unsubscribeFromOrderUpdates();
        this.toastService.error('Đã hết thời gian thanh toán. Vui lòng đặt lại.');
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  // Cơ chế Polling dự phòng để đảm bảo chuyển hướng ngay cả khi kết nối Realtime bị nghẽn
  async pollOrderStatus() {
    if (!this.createdOrderId) return;
    try {
      const order = await this.orderService.getOrderById(this.createdOrderId);
      if (order && order.status === 'confirmed') {
        this.handlePaymentSuccess(this.createdOrderId);
      }
    } catch (e) {
      console.warn('Lỗi khi tự động kiểm tra trạng thái đơn hàng:', e);
    }
  }

  // Đăng ký nhận cập nhật Real-time từ Supabase cho đơn hàng cụ thể này
  subscribeToOrderUpdates(orderId: string) {
    this.unsubscribeFromOrderUpdates();

    this.realTimeChannel = supabase
      .channel(`order-payment-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Real-time order update:', payload);
          // Sử dụng ngZone.run để đảm bảo Angular cập nhật giao diện ngay lập tức khi nhận được tín hiệu WebSockets ngoài Zone
          this.ngZone.run(() => {
            const newStatus = payload.new['status'];
            if (newStatus === 'confirmed') {
              this.handlePaymentSuccess(orderId);
            }
          });
        }
      )
      .subscribe();
  }

  unsubscribeFromOrderUpdates() {
    if (this.realTimeChannel) {
      supabase.removeChannel(this.realTimeChannel);
      this.realTimeChannel = null;
    }
  }

  handlePaymentSuccess(orderId: string) {
    this.stopTimer();
    this.isShowingQR = false;
    this.unsubscribeFromOrderUpdates();
    this.cartStore.clearCart();
    this.toastService.success('Xác nhận đã nhận tiền! Cảm ơn bạn.');
    this.router.navigate(['/order', orderId]);
  }

  async confirmPayment() {
    if (!this.createdOrderId) return;

    this.isPlacingOrder = true;
    try {
      const order = await this.orderService.getOrderById(this.createdOrderId);
      if (order && order.status === 'confirmed') {
        this.handlePaymentSuccess(this.createdOrderId);
      } else {
        this.toastService.show('Hệ thống chưa ghi nhận được giao dịch chuyển khoản của bạn. Vui lòng đợi trong giây lát hoặc kiểm tra lại.', 'info');
      }
    } catch (e) {
      this.toastService.error('Có lỗi xảy ra khi kiểm tra trạng thái thanh toán.');
    } finally {
      this.isPlacingOrder = false;
    }
  }

  cancelPayment() {
    this.stopTimer();
    this.isShowingQR = false;
    this.unsubscribeFromOrderUpdates();

    if (this.createdOrderId) {
      this.cartStore.clearCart();
      this.toastService.show('Đơn hàng đã được lưu ở trạng thái chờ thanh toán.', 'info');
      this.router.navigate(['/order', this.createdOrderId]);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  }
}