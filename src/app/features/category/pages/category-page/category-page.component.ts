import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../product/services/product.service';
import { Product } from '../../../product/models/product.models';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss'
})
export class CategoryPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  categoryName = '';
  categorySlug = '';
  products: Product[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categorySlug = params.get('slug') || '';
      this.loadProducts();
    });
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe(products => {
      this.products = products.filter(p => p.categorySlug === this.categorySlug);
      if (this.products.length > 0) {
        this.categoryName = this.products[0].categoryName;
      }
      this.isLoading = false;
    });
  }
}