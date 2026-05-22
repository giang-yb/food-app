import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductReview } from '../../models/product.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ProductDbService } from '../../../../core/services/product-db.service';
import { supabase } from '../../../../core/supabase/supabase.client';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.scss'
})
export class ProductReviewsComponent implements OnInit, OnChanges {
  @Input() reviews: ProductReview[] = [];
  @Input() productId = '';
  @Input() productName = '';

  reviewForm: FormGroup;
  hoveredStar = 0;
  isSubmitting = false;

  canReview = false; 
  orderIdToReview: string | undefined = undefined;

  private authService = inject(AuthService);
  private productDbService = inject(ProductDbService);

  constructor(private fb: FormBuilder) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.checkReviewEligibility();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productId'] && !changes['productId'].isFirstChange()) {
      this.checkReviewEligibility();
    }
  }

  async checkReviewEligibility() {
    const user = this.authService.user();
    if (!user) {
      this.canReview = false;
      return;
    }

    try {
      const { canReview, orderId } = await this.productDbService.checkUserCanReview(this.productId, user.id);
      this.canReview = canReview;
      this.orderIdToReview = orderId;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      this.canReview = false;
      this.orderIdToReview = undefined;
    }
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

  async submitReview() {
    if (this.reviewForm.invalid || !this.canReview || !this.orderIdToReview) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const user = this.authService.user();
    if (!user) return;

    this.isSubmitting = true;

    const rating = this.reviewForm.value.rating;
    const comment = this.reviewForm.value.comment;

    const success = await this.productDbService.addReview({
      userId: user.id,
      productId: this.productId,
      orderId: this.orderIdToReview,
      rating,
      comment
    });

    if (success) {
      // Reload reviews dynamically without waiting for parent refresh
      const newReview: ProductReview = {
        id: 'new-' + Date.now(),
        productId: this.productId,
        userName: user.fullName || user.email,
        userAvatar: user.avatarUrl || 'https://i.pravatar.cc/100?img=11',
        rating: rating,
        comment: comment,
        createdAt: new Date().toISOString(),
        isVerified: true
      };

      this.reviews = [newReview, ...this.reviews];
      this.reviewForm.reset({ rating: 5, comment: '' });
      this.canReview = false; // Hide form after submitting
    } else {
      alert("Đã xảy ra lỗi khi lưu đánh giá. Vui lòng thử lại sau.");
    }

    this.isSubmitting = false;
  }
}