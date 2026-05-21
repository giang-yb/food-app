import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-gallery.component.html',
  styleUrl: './product-gallery.component.scss'
})
export class ProductGalleryComponent {
  @Input() images: string[] = [];
  @Input() productName = '';
  @Input() mainImageUrl = '';
  @Output() imageSelected = new EventEmitter<string>();

  selectedImageIndex = 0;

  get mainImage(): string {
    // Use images array if available, otherwise fall back to mainImageUrl
    if (this.images && this.images.length > 0) {
      return this.images[this.selectedImageIndex] || this.images[0];
    }
    return this.mainImageUrl;
  }

  get displayImages(): string[] {
    // If images array is empty but we have a mainImageUrl, use that
    if (!this.images || this.images.length === 0) {
      return this.mainImageUrl ? [this.mainImageUrl] : [];
    }
    return this.images;
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
    this.imageSelected.emit(this.displayImages[index]);
  }

  prevImage(): void {
    const len = this.displayImages.length;
    if (len <= 1) return;
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    } else {
      this.selectedImageIndex = len - 1;
    }
  }

  nextImage(): void {
    const len = this.displayImages.length;
    if (len <= 1) return;
    if (this.selectedImageIndex < len - 1) {
      this.selectedImageIndex++;
    } else {
      this.selectedImageIndex = 0;
    }
  }
}