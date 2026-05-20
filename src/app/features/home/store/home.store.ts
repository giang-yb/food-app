import { Injectable, signal, computed, effect } from '@angular/core';
import { Banner, Category, Product, FlashSale } from '../models/home.models';
import { HomeService } from '../services/home.service';

@Injectable({
  providedIn: 'root'
})
export class HomeStore {
  // State signals
  banners = signal<Banner[]>([]);
  activeBannerIndex = signal<number>(0);
  categories = signal<Category[]>([]);
  featuredProducts = signal<Product[]>([]);
  flashSale = signal<FlashSale | null>(null);
  countdownSeconds = signal<number>(0);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Private
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  // Computed
  countdownDisplay = computed(() => {
    const total = this.countdownSeconds();
    if (total <= 0) return 'Đã kết thúc';

    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  constructor(private homeService: HomeService) {
    // Cleanup on destroy
    effect(() => {
      return () => {
        this.stopCountdown();
      };
    });
  }

  setActiveBanner(index: number): void {
    const banners = this.banners();
    if (index >= 0 && index < banners.length) {
      this.activeBannerIndex.set(index);
    }
  }

  nextBanner(): void {
    const banners = this.banners();
    if (banners.length > 0) {
      const next = (this.activeBannerIndex() + 1) % banners.length;
      this.activeBannerIndex.set(next);
    }
  }

  startCountdown(): void {
    this.stopCountdown();

    const flashSale = this.flashSale();
    if (!flashSale) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(flashSale.endTime).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      this.countdownSeconds.set(diff);

      if (diff <= 0) {
        this.stopCountdown();
      }
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Load banners
    this.homeService.getPromotionalBanners().subscribe({
      next: (banners) => {
        this.banners.set(banners);
        // Random starting banner
        const randomIndex = Math.floor(Math.random() * banners.length);
        this.activeBannerIndex.set(randomIndex);
      },
      error: (err) => {
        console.error('[HomePage] loadAll: banners error', err);
        this.error.set('Không thể tải banners');
      }
    });

    // Load categories
    this.homeService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => {
        console.error('[HomePage] loadAll: categories error', err);
        this.error.set('Không thể tải danh mục');
      }
    });

    // Load featured products
    this.homeService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts.set(products);
      },
      error: (err) => {
        console.error('[HomePage] loadAll: products error', err);
        this.error.set('Không thể tải sản phẩm');
      }
    });

    // Load flash sale
    this.homeService.getFlashSale().subscribe({
      next: (flashSale) => {
        this.flashSale.set(flashSale);
        this.startCountdown();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[HomePage] loadAll: flash sale error', err);
        this.error.set('Không thể tải flash sale');
        this.isLoading.set(false);
      }
    });
  }
}