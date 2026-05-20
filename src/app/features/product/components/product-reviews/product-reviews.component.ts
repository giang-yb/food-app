import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductReview } from '../../models/product.models';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.scss'
})
export class ProductReviewsComponent {
  @Input() reviews: ProductReview[] = [];
  @Input() productName = '';

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

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}