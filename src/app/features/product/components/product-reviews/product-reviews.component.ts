import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductReview } from '../../models/product.models';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.scss'
})
export class ProductReviewsComponent {
  @Input() reviews: ProductReview[] = [];
  @Input() productId = '';
  @Input() productName = '';

  reviewForm: FormGroup;
  hoveredStar = 0;
  isSubmitting = false;

  // Giả lập trạng thái người dùng đã mua hàng. 
  // Thực tế sẽ cần gọi API kiểm tra đơn hàng (như mô tả ở dưới)
  canReview = true; 

  constructor(private fb: FormBuilder) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  get averageRating(): number {
    if (!this.reviews.length) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }

  get ratingDistribution(): { stars: number; percent: number; count: number }[] {
    return [5, 4, 3, 2, 1].map(stars => {
      const count = this.reviews.filter(r => r.rating === stars).length;
      const percent = this.reviews.length ? Math.round((count / this.reviews.length) * 100) : 0;
      return { stars, percent, count };
    });
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Giả lập gửi đánh giá
    setTimeout(() => {
      const newReview: ProductReview = {
        id: 'new-' + Date.now(),
        productId: this.productId,
        userName: 'Bạn', // Cần lấy từ AuthService
        userAvatar: 'https://i.pravatar.cc/100?img=11',
        rating: this.reviewForm.value.rating,
        comment: this.reviewForm.value.comment,
        createdAt: new Date().toISOString(),
        isVerified: true
      };

      // Thêm lên đầu mảng
      this.reviews = [newReview, ...this.reviews];
      this.reviewForm.reset({ rating: 5, comment: '' });
      this.isSubmitting = false;
      this.canReview = false; // Ẩn form sau khi đánh giá
    }, 1000);
  }
}