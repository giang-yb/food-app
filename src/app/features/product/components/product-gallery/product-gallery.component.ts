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
  @Output() imageSelected = new EventEmitter<string>();

  selectedImageIndex = 0;

  get mainImage(): string {
    return this.images[this.selectedImageIndex] || this.images[0] || '';
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
    this.imageSelected.emit(this.images[index]);
  }

  prevImage(): void {
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    } else {
      this.selectedImageIndex = this.images.length - 1;
    }
  }

  nextImage(): void {
    if (this.selectedImageIndex < this.images.length - 1) {
      this.selectedImageIndex++;
    } else {
      this.selectedImageIndex = 0;
    }
  }
}