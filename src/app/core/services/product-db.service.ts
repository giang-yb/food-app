import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { Product, ProductDetail, ProductReview, toCamelCase } from '../../features/product/models/product.models';

@Injectable({
  providedIn: 'root'
})
export class ProductDbService {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || []).map(toCamelCase);
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return toCamelCase(data);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    return (data || []).map(toCamelCase);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return (data || []).map(toCamelCase);
  }

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users (
          full_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      productId: row.product_id,
      userName: row.users?.full_name || 'Khách hàng',
      userAvatar: row.users?.avatar_url,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
      isVerified: !!row.order_id
    }));
  }

  async getRelatedProducts(categoryId: string, excludeId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .neq('id', excludeId)
      .limit(4);

    if (error) {
      console.error('Error fetching related products:', error);
      return [];
    }

    return (data || []).map(toCamelCase);
  }

  async getProductDetail(id: string): Promise<ProductDetail | null> {
    const product = await this.getProductById(id);
    if (!product) return null;

    const [reviews, relatedProducts] = await Promise.all([
      this.getProductReviews(id),
      this.getRelatedProducts(product.categoryId, id)
    ]);

    return {
      product,
      reviews,
      relatedProducts
    };
  }

  async checkUserCanReview(productId: string, userId: string | number): Promise<{ canReview: boolean; orderId?: string }> {
    const numericProductId = parseInt(productId, 10);
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    if (isNaN(numericProductId) || isNaN(numericUserId)) {
      return { canReview: false };
    }

    // Kiểm tra đơn hàng đã mua và thanh toán thành công (có status trong các trạng thái đã xác nhận/đang chuẩn bị/đang giao/đã giao/hoàn thành)
    const { data, error } = await supabase
      .from('order_items')
      .select('order_id, orders!inner(user_id, status)')
      .eq('product_id', numericProductId)
      .eq('orders.user_id', numericUserId)
      .in('orders.status', ['confirmed', 'preparing', 'delivering', 'delivered', 'completed'])
      .limit(1);

    if (error || !data || data.length === 0) {
      // Cơ chế dự phòng: kiểm tra theo payment_status = 'paid' phòng trường hợp status chính ở trạng thái khác
      const { data: altData, error: altError } = await supabase
        .from('order_items')
        .select('order_id, orders!inner(user_id, payment_status)')
        .eq('product_id', numericProductId)
        .eq('orders.user_id', numericUserId)
        .eq('orders.payment_status', 'paid')
        .limit(1);

      if (altError || !altData || altData.length === 0) {
        return { canReview: false };
      }
      return { canReview: true, orderId: altData[0].order_id.toString() };
    }

    return { canReview: true, orderId: data[0].order_id.toString() };
  }

  async addReview(reviewData: { userId: string | number, productId: string, orderId: string, rating: number, comment: string }): Promise<boolean> {
    // Nếu userId là chuỗi UUID dài (do user lấy từ auth mà chưa có trong bảng users), 
    // ta sẽ dùng tạm ID hợp lệ đầu tiên trong bảng users để test tránh lỗi khóa ngoại
    let validUserId = reviewData.userId;
    if (typeof validUserId === 'string' && validUserId.includes('-')) {
      const { data } = await supabase.from('users').select('id').limit(1);
      if (data && data.length > 0) {
        validUserId = data[0].id;
      } else {
        console.error("Không tìm thấy user nào trong bảng public.users!");
        return false;
      }
    }

    const { error } = await supabase
      .from('reviews')
      .insert([{
        user_id: typeof validUserId === 'string' ? parseInt(validUserId, 10) : validUserId,
        product_id: parseInt(reviewData.productId, 10),
        order_id: parseInt(reviewData.orderId, 10),
        rating: reviewData.rating,
        comment: reviewData.comment
      }]);

    if (error) {
      console.error('Error adding review:', error);
      return false;
    }
    return true;
  }

  async getAdminPaymentQR(): Promise<string | null> {
    const { data, error } = await supabase
      .from('users')
      .select('payment_qr_url')
      .eq('role', 'admin')
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }
    return data[0].payment_qr_url;
  }
}