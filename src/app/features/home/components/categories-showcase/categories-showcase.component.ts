import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeStore } from '../../store/home.store';

@Component({
  selector: 'app-categories-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories-showcase.component.html',
  styleUrl: './categories-showcase.component.scss'
})
export class CategoriesShowcaseComponent {
  homeStore = inject(HomeStore);

  trackByCategoryId(index: number): string {
    const categories = this.homeStore.categories();
    return categories[index]?.id || String(index);
  }
}