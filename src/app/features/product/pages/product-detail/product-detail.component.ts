import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductDbService } from '../../../../core/services/product-db.service';
import { ProductDetail } from '../../models/product.models';
import { ProductGalleryComponent } from '../../components/product-gallery/product-gallery.component';
import { ProductInfoComponent } from '../../components/product-info/product-info.component';
import { ProductReviewsComponent } from '../../components/product-reviews/product-reviews.component';
import { ProductRelatedComponent } from '../../components/product-related/product-related.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductGalleryComponent,
    ProductInfoComponent,
    ProductReviewsComponent,
    ProductRelatedComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productDbService = inject(ProductDbService);

  productDetail: ProductDetail | undefined;
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.error = 'Không tìm thấy sản phẩm';
      this.isLoading = false;
    }
  }

  onAddToCart(product: any): void {
    console.log('[ProductDetail] Add to cart event from ProductInfo:', product.name);
  }

  private loadProduct(id: string): void {
    console.log('[ProductDetail] Loading product:', id);
    this.productDbService.getProductDetail(id).then((detail) => {
      if (detail) {
        this.productDetail = detail;
        console.log('[ProductDetail] Product loaded:', detail.product.name);
      } else {
        this.error = 'Không tìm thấy sản phẩm';
      }
      this.isLoading = false;
    }).catch((err: unknown) => {
      console.error('[ProductDetail] Error loading product:', err);
      this.error = 'Đã xảy ra lỗi khi tải sản phẩm';
      this.isLoading = false;
    });
  }
}