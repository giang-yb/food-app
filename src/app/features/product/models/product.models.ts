// Product Data Models - Angular standard (camelCase)

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images: string[];
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  purchaseCount: number;
  isAvailable: boolean;
  tags: string[];
  createdAt?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
}

export interface ProductDetail {
  product: Product;
  reviews: ProductReview[];
  relatedProducts: Product[];
}

// Convert Supabase snake_case to Angular camelCase
export function toCamelCase(product: any): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.original_price,
    imageUrl: product.image_url,
    images: product.images || [],
    categoryId: product.category_id,
    categoryName: product.category_name,
    categorySlug: product.category_slug,
    rating: product.rating || 0,
    reviewCount: product.review_count || 0,
    purchaseCount: product.purchase_count || 0,
    isAvailable: product.is_available ?? true,
    tags: product.tags || [],
    createdAt: product.created_at
  };
}