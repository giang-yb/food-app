import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product, ProductReview, ProductDetail } from '../models/product.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  getProductById(id: string): Observable<Product | undefined> {
    const products = this.getMockProducts();
    const product = products.find(p => p.id === id);
    return of(product);
  }

  getProductDetail(id: string): Observable<ProductDetail | undefined> {
    const products = this.getMockProducts();
    const product = products.find(p => p.id === id);

    if (!product) return of(undefined);

    const detail: ProductDetail = {
      product,
      reviews: this.getMockReviews(id),
      relatedProducts: products.filter(p => p.categoryId === product.categoryId && p.id !== id).slice(0, 4)
    };

    return of(detail);
  }

  getProducts(): Observable<Product[]> {
    return of(this.getMockProducts());
  }

  getRelatedProducts(categoryId: string, excludeId: string): Observable<Product[]> {
    return of(
      this.getMockProducts()
        .filter(p => p.categoryId === categoryId && p.id !== excludeId)
        .slice(0, 4)
    );
  }

  private getMockProducts(): Product[] {
    return [
      {
        id: '1',
        name: 'Bánh Mì Thịt Nướng',
        description: 'Bánh mì giòn tan với thịt nướng thơm phức, pate béo ngậy, rau dưa giòn chua ngọt. Món ăn sáng phổ biến của người Việt, kết hợp hoàn hảo giữa ẩm thực Pháp và Việt Nam. Thịt nướng được tẩm ướp qua đêm với các gia vị đặc trưng, nướng trên than hoa cho mùi thơm quyến rũ.',
        price: 45000,
        originalPrice: 55000,
        imageUrl: '/assets/images/products/banh-mi-thit-nuong.jpg',
        images: [
          '/assets/images/products/banh-mi-thit-nuong.jpg',
          '/assets/images/products/banh-mi-thit-nuong-2.jpg',
          '/assets/images/products/banh-mi-thit-nuong-3.jpg'
        ],
        categoryId: '1',
        categoryName: 'Bánh mì',
        categorySlug: 'banh-mi',
        rating: 4.8,
        reviewCount: 156,
        purchaseCount: 1250,
        isAvailable: true,
        tags: ['bánh mì', 'thịt nướng', '早餐', 'Việt Nam']
      },
      {
        id: '2',
        name: 'Cơm Gà Xối Mỡ',
        description: 'Cơm gà xối mỡ với gà ta chiên giòn vàng ươm, da giòn rục, thịt mềm ngọt. Ăn kèm với dưa gội chua ngọt, rau thơm và nước mắm pha chua ngọt đậm đà. Một món ăn no bụng, bổ dưỡng và rất được yêu thích.',
        price: 55000,
        imageUrl: '/assets/images/products/com-ga-xoi-mo.jpg',
        images: [
          '/assets/images/products/com-ga-xoi-mo.jpg'
        ],
        categoryId: '2',
        categoryName: 'Cơm',
        categorySlug: 'com',
        rating: 4.6,
        reviewCount: 89,
        purchaseCount: 680,
        isAvailable: true,
        tags: ['cơm', 'gà', 'chiên', 'Việt Nam']
      },
      {
        id: '3',
        name: 'Nước Ép Cam Tươi',
        description: 'Nước ép cam nguyên chất 100%, không đường, không chất bảo quản. Cam được chọn lọc kỹ lưỡng, vắt tươi mỗi ngày đảm bảo độ ngọt tự nhiên và vitamin C dồi dào. Thức uống giải khát hoàn hảo cho những ngày nóng bức.',
        price: 25000,
        imageUrl: '/assets/images/products/nuoc-ep-cam.jpg',
        images: [
          '/assets/images/products/nuoc-ep-cam.jpg'
        ],
        categoryId: '3',
        categoryName: 'Nước ép',
        categorySlug: 'nuoc-ep',
        rating: 4.9,
        reviewCount: 234,
        purchaseCount: 2100,
        isAvailable: true,
        tags: ['nước ép', 'cam', 'vitamin C', 'giải khát']
      },
      {
        id: '4',
        name: 'Sinh Tố Bơ',
        description: 'Sinh tố bơ sánh mịn, béo ngậy với bơ chín ngon nhất. Thêm một chút sữa đặc và đá xay mịn lạnh, tạo nên thức uống bổ dưỡng giàu chất béo tốt. Hoàn hảo cho bữa sáng nhanh hoặc giải khát buổi chiều.',
        price: 35000,
        imageUrl: '/assets/images/products/sinh-to-bo.jpg',
        images: [
          '/assets/images/products/sinh-to-bo.jpg'
        ],
        categoryId: '4',
        categoryName: 'Sinh tố',
        categorySlug: 'sinh-to',
        rating: 4.7,
        reviewCount: 178,
        purchaseCount: 890,
        isAvailable: true,
        tags: ['sinh tố', 'bơ', 'sữa', 'bổ dưỡng']
      },
      {
        id: '5',
        name: 'Kem Vanilla',
        description: 'Kem vanilla hảo hạng làm từ vanilla Madagascar nguyên chất, kem tươi và đường mía. Công thức độc đáo tạo nên kết cấu mịn màng, không quá ngọt, với hương vanilla thơm lừng. Ăn một muỗng là đủ để lưu giữ mãi vị tuổi thơ.',
        price: 28000,
        originalPrice: 35000,
        imageUrl: '/assets/images/products/kem-vanilla.jpg',
        images: [
          '/assets/images/products/kem-vanilla.jpg'
        ],
        categoryId: '5',
        categoryName: 'Kem',
        categorySlug: 'kem',
        rating: 4.5,
        reviewCount: 67,
        purchaseCount: 450,
        isAvailable: true,
        tags: ['kem', 'vanilla', 'tráng miệng', 'mát lạnh']
      },
      {
        id: '6',
        name: 'Bánh Mì Pate',
        description: 'Bánh mì pate với pate gan thơm ngon, bơ đậu phộng giòn tan. Pate được làm từ gan gà và thịt heo xay nhuyễn, nêm nếm vừa ăn. Một biến thể độc đáo của bánh mì Việt Nam.',
        price: 40000,
        imageUrl: '/assets/images/products/banh-mi-pate.jpg',
        images: [
          '/assets/images/products/banh-mi-pate.jpg'
        ],
        categoryId: '1',
        categoryName: 'Bánh mì',
        categorySlug: 'banh-mi',
        rating: 4.4,
        reviewCount: 112,
        purchaseCount: 720,
        isAvailable: true,
        tags: ['bánh mì', 'pate', '早餐']
      },
      {
        id: '7',
        name: 'Cơm Chiên Dương Cầu',
        description: 'Cơm chiên Dương Cầu với trứng chiên vàng ruộm, thịt xá xíu thơm lừng, đậu phộng giòn. Cơm rang khô ráo, từng hạt cơm bóngóng ánh, giòn ngoài мягко trong. Một món ăn nổi tiếng của người Hoa.',
        price: 60000,
        imageUrl: '/assets/images/products/com-chien-duong-cau.jpg',
        images: [
          '/assets/images/products/com-chien-duong-cau.jpg'
        ],
        categoryId: '2',
        categoryName: 'Cơm',
        categorySlug: 'com',
        rating: 4.3,
        reviewCount: 95,
        purchaseCount: 520,
        isAvailable: true,
        tags: ['cơm', 'chiên', 'Dương Cầu', 'Trung Hoa']
      },
      {
        id: '8',
        name: 'Sinh Tố Dâu',
        description: 'Sinh tố dâu tươi với dâu花园 được chọn từ Đà Lạt, ngọt thanh và thơm mát. Kết hợp với sữa chua Hy Lạp và một chút mật ong, tạo nên thức uống vừa healthy vừa ngon miệng.',
        price: 38000,
        imageUrl: '/assets/images/products/sinh-to-dau.jpg',
        images: [
          '/assets/images/products/sinh-to-dau.jpg'
        ],
        categoryId: '4',
        categoryName: 'Sinh tố',
        categorySlug: 'sinh-to',
        rating: 4.8,
        reviewCount: 201,
        purchaseCount: 1100,
        isAvailable: true,
        tags: ['sinh tố', 'dâu', 'sữa chua', 'healthy']
      }
    ];
  }

  private getMockReviews(productId: string): ProductReview[] {
    const reviews: ProductReview[] = [
      {
        id: 'r1',
        productId: productId,
        userName: 'Nguyễn Văn A',
        userAvatar: 'https://i.pravatar.cc/100?img=1',
        rating: 5,
        comment: 'Món ăn rất ngon! Đóng gói cẩn thận, giao hàng nhanh. Sẽ ủng hộ lâu dài.',
        createdAt: new Date('2024-01-15'),
        isVerified: true
      },
      {
        id: 'r2',
        productId: productId,
        userName: 'Trần Thị B',
        userAvatar: 'https://i.pravatar.cc/100?img=2',
        rating: 4,
        comment: 'Ngon, giá cả hợp lý. Một điểm trừ là giao hàng hơi lâu một chút.',
        createdAt: new Date('2024-01-10'),
        isVerified: true
      },
      {
        id: 'r3',
        productId: productId,
        userName: 'Lê Văn C',
        userAvatar: 'https://i.pravatar.cc/100?img=3',
        rating: 5,
        comment: 'Đã mua nhiều lần, lần nào cũng rất hài lòng. Đề xuất mọi người nên thử!',
        createdAt: new Date('2024-01-05'),
        isVerified: true
      },
      {
        id: 'r4',
        productId: productId,
        userName: 'Phạm Thị D',
        rating: 4,
        comment: 'Khá ngon nhưng theo tôi thì hơi mặn một chút. Nói chung vẫn ổn.',
        createdAt: new Date('2023-12-28'),
        isVerified: false
      }
    ];

    return reviews;
  }
}