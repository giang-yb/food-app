import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Banner, Category, Product, FlashSale } from '../models/home.models';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  getPromotionalBanners(): Observable<Banner[]> {
    const banners: Banner[] = [
      {
        id: '1',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
        title: 'Miễn phí giao hàng',
        subtitle: 'Cho đơn từ 100K',
        ctaText: 'Khám phá ngay',
        ctaLink: '/menu'
      },
      {
        id: '2',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
        title: 'Flash Sale',
        subtitle: 'Giảm 50% hôm nay!',
        ctaText: 'Xem ngay',
        ctaLink: '/flash-sale'
      },
      {
        id: '3',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
        title: 'Khách hàng mới',
        subtitle: 'Giảm ngay 20%',
        ctaText: 'Đăng ký ngay',
        ctaLink: '/auth/register'
      },
      {
        id: '4',
        imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop',
        title: 'Mua 2 tặng 1',
        subtitle: 'Áp dụng toàn bộ menu',
        ctaText: 'Xem Deals',
        ctaLink: '/menu'
      }
    ];

    // Shuffle to show random banner first
    const shuffled = [...banners].sort(() => Math.random() - 0.5);
    return of(shuffled);
  }

  getCategories(): Observable<Category[]> {
    const categories: Category[] = [
      { id: '1', name: 'Bánh mì', icon: '🍞', slug: 'banh-mi' },
      { id: '2', name: 'Cơm', icon: '🍚', slug: 'com' },
      { id: '3', name: 'Nước ép', icon: '🥤', slug: 'nuoc-ep' },
      { id: '4', name: 'Sinh tố', icon: '🥤', slug: 'sinh-to' },
      { id: '5', name: 'Kem', icon: '🍦', slug: 'kem' }
    ];
    return of(categories);
  }

  getFeaturedProducts(): Observable<Product[]> {
    const products: Product[] = [
      {
        id: '1',
        name: 'Bánh Mì Thịt Nướng',
        price: 45000,
        originalPrice: 55000,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
        categoryId: '1',
        categoryName: 'Bánh mì',
        rating: 4.8,
        reviewCount: 156
      },
      {
        id: '2',
        name: 'Cơm Gà Xối Mỡ',
        price: 55000,
        imageUrl: 'https://images.unsplash.com/photo-1565928028035-7e2c9e3e5c1e?w=400&h=400&fit=crop',
        categoryId: '2',
        categoryName: 'Cơm',
        rating: 4.6,
        reviewCount: 89
      },
      {
        id: '3',
        name: 'Nước Ép Cam Tươi',
        price: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop',
        categoryId: '3',
        categoryName: 'Nước ép',
        rating: 4.9,
        reviewCount: 234
      },
      {
        id: '4',
        name: 'Sinh Tố Bơ',
        price: 35000,
        imageUrl: 'https://images.unsplash.com/photo-1628637340696-4cf84bb71bd5?w=400&h=400&fit=crop',
        categoryId: '4',
        categoryName: 'Sinh tố',
        rating: 4.7,
        reviewCount: 178
      },
      {
        id: '5',
        name: 'Kem Vanilla',
        price: 28000,
        originalPrice: 35000,
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019a59f?w=400&h=400&fit=crop',
        categoryId: '5',
        categoryName: 'Kem',
        rating: 4.5,
        reviewCount: 67
      },
      {
        id: '6',
        name: 'Bánh Mì Pate',
        price: 40000,
        imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db94?w=400&h=400&fit=crop',
        categoryId: '1',
        categoryName: 'Bánh mì',
        rating: 4.4,
        reviewCount: 112
      },
      {
        id: '7',
        name: 'Cơm Chiên Dương Cầu',
        price: 60000,
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop',
        categoryId: '2',
        categoryName: 'Cơm',
        rating: 4.3,
        reviewCount: 95
      },
      {
        id: '8',
        name: 'Sinh Tố Dâu',
        price: 38000,
        imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
        categoryId: '4',
        categoryName: 'Sinh tố',
        rating: 4.8,
        reviewCount: 201
      }
    ];
    return of(products);
  }

  getFlashSale(): Observable<FlashSale> {
    // Flash sale ends in 24 hours from now
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);

    const flashSale: FlashSale = {
      id: 'fs-1',
      endTime: endTime,
      products: [
        {
          id: '1',
          name: 'Bánh Mì Thịt Nướng',
          price: 45000,
          originalPrice: 55000,
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
          categoryId: '1',
          categoryName: 'Bánh mì',
          rating: 4.8,
          reviewCount: 156
        },
        {
          id: '5',
          name: 'Kem Vanilla',
          price: 28000,
          originalPrice: 35000,
          imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019a59f?w=400&h=400&fit=crop',
          categoryId: '5',
          categoryName: 'Kem',
          rating: 4.5,
          reviewCount: 67
        }
      ]
    };

    return of(flashSale);
  }
}