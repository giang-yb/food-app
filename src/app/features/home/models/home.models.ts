// Home Page Data Models

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // emoji
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  rating: number;
  reviewCount: number;
}

export interface FlashSale {
  id: string;
  endTime: Date;
  products: Product[];
}