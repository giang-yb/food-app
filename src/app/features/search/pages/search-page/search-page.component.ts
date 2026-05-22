import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ProductService } from '../../../product/services/product.service';
import { Product } from '../../../product/models/product.models';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ProductCardComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  searchControl = new FormControl('', { nonNullable: true });

  get query(): string {
    return this.searchControl.value;
  }
  products: Product[] = [];
  isLoading = false;
  hasSearched = false;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q') || '';
      this.searchControl.setValue(q);
      if (q) {
        this.search();
      }
    });
  }

  onSearch(): void {
    if (this.searchControl.value.trim()) {
      this.search();
    }
  }

  private search(): void {
    this.isLoading = true;
    this.hasSearched = true;
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        const searchLower = this.query.toLowerCase().trim();
        this.products = products.filter((p: Product) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}