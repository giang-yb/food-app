import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  async onSubmit(): Promise<void> {
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const result = await this.authService.signUp(this.email, this.password, this.fullName);

    this.isLoading = false;

    if (result.success) {
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      this.router.navigate(['/auth/login']);
    } else {
      this.errorMessage = result.error || 'Đăng ký thất bại';
    }
  }
}