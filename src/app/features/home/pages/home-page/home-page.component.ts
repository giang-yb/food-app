import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeStore } from '../../store/home.store';
import { HeroBannerComponent } from '../../components/hero-banner/hero-banner.component';
import { CategoriesShowcaseComponent } from '../../components/categories-showcase/categories-showcase.component';
import { FeaturedProductsComponent } from '../../components/featured-products/featured-products.component';
import { PromotionalSectionComponent } from '../../components/promotional-section/promotional-section.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroBannerComponent,
    CategoriesShowcaseComponent,
    FeaturedProductsComponent,
    PromotionalSectionComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  protected homeStore = inject(HomeStore);

  ngOnInit(): void {
    console.log('[HomePage] init: loading all data');
    this.homeStore.loadAll();
  }
}