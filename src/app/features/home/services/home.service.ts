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
        imageUrl: '/assets/images/banner-1.jpg',
        title: 'Miễn phí giao hàng',
        subtitle: 'Cho đơn từ 100K',
        ctaText: 'Khám phá ngay',
        ctaLink: '/menu'
      },
      {
        id: '2',
        imageUrl: '/assets/images/banner-2.jpg',
        title: 'Flash Sale',
        subtitle: 'Giảm 50% hôm nay!',
        ctaText: 'Xem ngay',
        ctaLink: '/flash-sale'
      },
      {
        id: '3',
        imageUrl: '/assets/images/banner-3.jpg',
        title: 'Khách hàng mới',
        subtitle: 'Giảm ngay 20%',
        ctaText: 'Đăng ký ngay',
        ctaLink: '/auth/register'
      },
      {
        id: '4',
        imageUrl: '/assets/images/banner-4.jpg',
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
        imageUrl: '/assets/images/products/banh-mi-thit-nuong.jpg',
        categoryId: '1',
        categoryName: 'Bánh mì',
        rating: 4.8,
        reviewCount: 156
      },
      {
        id: '2',
        name: 'Cơm Gà Xối Mỡ',
        price: 55000,
        imageUrl: '/assets/images/products/com-ga-xoi-mo.jpg',
        categoryId: '2',
        categoryName: 'Cơm',
        rating: 4.6,
        reviewCount: 89
      },
      {
        id: '3',
        name: 'Nước Ép Cam Tươi',
        price: 25000,
        imageUrl: '/assets/images/products/nuoc-ep-cam.jpg',
        categoryId: '3',
        categoryName: 'Nước ép',
        rating: 4.9,
        reviewCount: 234
      },
      {
        id: '4',
        name: 'Sinh Tố Bơ',
        price: 35000,
        imageUrl: '/assets/images/products/sinh-to-bo.jpg',
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
        imageUrl: '/assets/images/products/kem-vanilla.jpg',
        categoryId: '5',
        categoryName: 'Kem',
        rating: 4.5,
        reviewCount: 67
      },
      {
        id: '6',
        name: 'Bánh Mì Pate',
        price: 40000,
        imageUrl: '/assets/images/products/banh-mi-pate.jpg',
        categoryId: '1',
        categoryName: 'Bánh mì',
        rating: 4.4,
        reviewCount: 112
      },
      {
        id: '7',
        name: 'Cơm Chiên Dương Cầu',
        price: 60000,
        imageUrl: '/assets/images/products/com-chien-duong-cau.jpg',
        categoryId: '2',
        categoryName: 'Cơm',
        rating: 4.3,
        reviewCount: 95
      },
      {
        id: '8',
        name: 'Sinh Tố Dâu',
        price: 38000,
        imageUrl: '/assets/images/products/sinh-to-dau.jpg',
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
          imageUrl: '/assets/images/products/banh-mi-thit-nuong.jpg',
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
          imageUrl: '/assets/images/products/kem-vanilla.jpg',
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