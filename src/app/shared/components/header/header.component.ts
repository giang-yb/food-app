import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CartStore } from '../../../features/cart/store/cart.store';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private cartStore = inject(CartStore);
  private authService = inject(AuthService);
  private router = inject(Router);

  isScrolled = signal(false);
  searchControl = new FormControl('');

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  get itemCount(): number {
    return this.cartStore.totalItems();
  }

  get showBadge(): boolean {
    return this.cartStore.totalItems() > 0;
  }

  get user(): any {
    return this.authService.user();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  onSearch(): void {
    const value = this.searchControl.value?.trim();
    if (value) {
      this.router.navigate(['/search'], { queryParams: { q: value } });
      this.searchControl.setValue('');
    }
  }

  async onLogout(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}