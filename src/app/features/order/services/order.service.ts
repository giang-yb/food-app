import { Injectable, signal } from '@angular/core';
import { CartItem } from '../../cart/models/cart.models';

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: Date;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders = signal<Order[]>([]);

  getOrders(): Order[] {
    return this.orders();
  }

  createOrder(items: CartItem[], customerInfo: { name: string; phone: string; address: string }): Order {
    const order: Order = {
      id: 'ORD-' + Date.now(),
      items: [...items],
      totalPrice: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
      status: 'pending',
      createdAt: new Date(),
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      deliveryAddress: customerInfo.address
    };

    this.orders.update(orders => [...orders, order]);
    return order;
  }

  updateOrderStatus(orderId: string, status: Order['status']): void {
    this.orders.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, status } : o)
    );
  }

  getOrderById(orderId: string): Order | undefined {
    return this.orders().find(o => o.id === orderId);
  }
}