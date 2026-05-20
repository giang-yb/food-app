// Product Data Models

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
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
  isVerified: boolean;
}

export interface ProductDetail {
  product: Product;
  reviews: ProductReview[];
  relatedProducts: Product[];
}