import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown-timer.component.html',
  styleUrl: './countdown-timer.component.scss'
})
export class CountdownTimerComponent {
  @Input() seconds: number = 0;

  get isEnded(): boolean {
    return this.seconds <= 0;
  }

  get isFinalHour(): boolean {
    return this.seconds > 0 && this.seconds <= 3600;
  }

  get hours(): string {
    return Math.floor(this.seconds / 3600).toString().padStart(2, '0');
  }

  get minutes(): string {
    return Math.floor((this.seconds % 3600) / 60).toString().padStart(2, '0');
  }

  get secs(): string {
    return (this.seconds % 60).toString().padStart(2, '0');
  }
}