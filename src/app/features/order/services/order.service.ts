import { Injectable, inject } from '@angular/core';
import { CartItem } from '../../cart/models/cart.models';
import { supabase } from '../../../core/supabase/supabase.client';
import { AuthService } from '../../../core/services/auth.service';

export interface Order {
  id: string;
  orderCode: string;
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
  private authService = inject(AuthService);

  async createOrder(items: CartItem[], customerInfo: { name: string; phone: string; address: string }): Promise<Order> {
    const user = this.authService.user();
    if (!user) {
      throw new Error('Bạn cần đăng nhập để đặt hàng.');
    }

    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Tạo mã đơn hàng duy nhất để thỏa mãn ràng buộc NOT NULL của bảng orders
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const orderCode = `ORD-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // 1. Lưu thông tin vào bảng 'orders'
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_code: orderCode, // Ràng buộc NOT NULL
        total_amount: totalPrice,
        discount_amount: 0,
        final_amount: totalPrice, // Ràng buộc NOT NULL
        status: 'pending',
        payment_method: 'banking',
        payment_status: 'pending',
        phone: customerInfo.phone,
        delivery_address: customerInfo.address,
        note: `Người nhận: ${customerInfo.name}` // Lưu tên người nhận vào cột note
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Lỗi khi lưu đơn hàng:', orderError);
      throw new Error(orderError?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    }

    // 2. Lưu chi tiết món ăn vào bảng 'order_items'
    const orderItemsPayload = items.map(item => ({
      order_id: orderData.id,
      product_id: parseInt(item.product.id, 10),
      quantity: item.quantity,
      price_at_time: item.product.price, // Thỏa mãn các cột chi tiết của bảng order_items
      subtotal: item.product.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error('Lỗi khi lưu chi tiết đơn hàng:', itemsError);
      // Xóa đơn hàng cha nếu chèn chi tiết lỗi để tránh dữ liệu rác
      await supabase.from('orders').delete().eq('id', orderData.id);
      throw new Error('Không thể tạo chi tiết đơn hàng. Vui lòng thử lại.');
    }

    return {
      id: orderData.id.toString(),
      orderCode: orderData.order_code,
      items: [...items],
      totalPrice,
      status: 'pending',
      createdAt: new Date(orderData.created_at || new Date()),
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      deliveryAddress: customerInfo.address
    };
  }

  async getOrderById(orderId: string): Promise<Order | undefined> {
    const numericId = parseInt(orderId, 10);
    if (isNaN(numericId)) return undefined;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, users(full_name), order_items(*, products(*))')
      .eq('id', numericId)
      .single();

    if (orderError || !order) {
      console.error('Lỗi khi lấy thông tin đơn hàng:', orderError);
      return undefined;
    }

    // Map dữ liệu từ Database về interface Order ở Frontend
    const mappedItems: CartItem[] = (order.order_items || []).map((item: any) => ({
      product: {
        id: item.products.id.toString(),
        name: item.products.name,
        price: item.products.price,
        imageUrl: item.products.image_url || item.products.imageUrl || 'assets/placeholder.jpg',
        description: item.products.description,
        categoryId: item.products.category_id?.toString() || '',
        categoryName: '',
        rating: 5,
        reviewCount: 0
      },
      quantity: item.quantity
    }));

    let customerName = order.users?.full_name || 'Khách hàng';
    if (order.note && order.note.startsWith('Người nhận: ')) {
      customerName = order.note.replace('Người nhận: ', '');
    }

    return {
      id: order.id.toString(),
      orderCode: order.order_code,
      items: mappedItems,
      totalPrice: Number(order.total_amount),
      status: order.status,
      createdAt: new Date(order.created_at),
      customerName,
      customerPhone: order.phone || '',
      deliveryAddress: order.delivery_address || ''
    };
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const numericId = parseInt(orderId, 10);
    if (isNaN(numericId)) return;

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', numericId);

    if (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    }
  }
}