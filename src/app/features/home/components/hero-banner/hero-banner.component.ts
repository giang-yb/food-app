import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeStore } from '../../store/home.store';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss'
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  protected homeStore = inject(HomeStore);
  private autoPlayInterval: ReturnType<typeof setInterval> | null = null;

  readonly AUTO_PLAY_DELAY = 5000;

  ngOnInit(): void {
    console.log('[HeroBanner] init');
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      console.log('[HeroBanner] auto-play: next banner');
      this.homeStore.nextBanner();
    }, this.AUTO_PLAY_DELAY);
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  goToSlide(index: number): void {
    console.log('[HeroBanner] goToSlide:', index);
    this.homeStore.setActiveBanner(index);
    // Reset auto-play timer on manual navigation
    this.startAutoPlay();
  }

  get currentBanner() {
    const banners = this.homeStore.banners();
    const index = this.homeStore.activeBannerIndex();
    return banners[index] || null;
  }

  get totalBanners() {
    return this.homeStore.banners().length;
  }

  get shouldShowIndicators() {
    return this.totalBanners > 1;
  }

  trackByBannerId(index: number): number {
    return index;
  }
}