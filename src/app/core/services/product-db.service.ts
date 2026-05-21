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
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return data || [];
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
}