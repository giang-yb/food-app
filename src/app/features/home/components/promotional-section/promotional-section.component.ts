import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeStore } from '../../store/home.store';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-promotional-section',
  standalone: true,
  imports: [CommonModule, RouterModule, CountdownTimerComponent, ProductCardComponent],
  templateUrl: './promotional-section.component.html',
  styleUrl: './promotional-section.component.scss'
})
export class PromotionalSectionComponent {
  homeStore = inject(HomeStore);

  trackByProductId(index: number): string {
    const products = this.homeStore.flashSale()?.products || [];
    return products[index]?.id || String(index);
  }

  get hasFlashSaleProducts(): boolean {
    const products = this.homeStore.flashSale()?.products || [];
    return products.length > 0;
  }
}