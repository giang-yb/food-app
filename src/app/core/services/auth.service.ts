import { Injectable, signal, computed } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSignal = signal<User | null>(null);

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');

  constructor() {
    this.checkCurrentUser();
  }

  private async checkCurrentUser(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await this.fetchUserProfile(session.user.email!);
  }

  private async fetchUserProfile(email: string): Promise<void> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle(); // ✅ trả về null thay vì lỗi khi không tìm thấy row

    if (data && !error) {
      this.userSignal.set({
        id: data.id,
        email: data.email,
        fullName: data.full_name || data.email?.split('@')[0] || 'User',
        role: data.role || 'customer',
        phone: data.phone,
        address: data.address,
        avatarUrl: data.avatar_url,
        paymentQrUrl: data.payment_qr_url,
        createdAt: data.created_at,
      });
    } else {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser && authUser.email === email) {
        // Tự động tạo bản ghi trong bảng public.users nếu chưa tồn tại
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            email: email,
            full_name: authUser.user_metadata?.['full_name'] || email.split('@')[0] || 'User',
            role: 'customer'
          })
          .select()
          .single();

        if (newProfile && !insertError) {
          this.userSignal.set({
            id: newProfile.id, // bigint ID thực tế từ database
            email: newProfile.email,
            fullName: newProfile.full_name || email.split('@')[0] || 'User',
            role: newProfile.role || 'customer',
            phone: newProfile.phone,
            address: newProfile.address,
            avatarUrl: newProfile.avatar_url,
            paymentQrUrl: newProfile.payment_qr_url,
            createdAt: newProfile.created_at,
          });
        } else {
          console.error('Lỗi khi tự động tạo profile public.users:', insertError);
          // Dự phòng dùng tạm UUID (mặc dù có thể gây lỗi khóa ngoại ở một số bảng)
          this.userSignal.set({
            id: authUser.id,
            email: authUser.email!,
            fullName: authUser.user_metadata?.['full_name'] || authUser.email?.split('@')[0] || 'User',
            role: 'customer',
            createdAt: authUser.created_at || new Date().toISOString(),
          });
        }
      }
    }
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      await this.fetchUserProfile(data.user.email!);
    }

    return { success: true };
  }

  async signUp(
    email: string,
    password: string,
    fullName: string,
  ): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer',
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'Email này đã được đăng ký. Vui lòng đăng nhập!' };
      }
      return { success: false, error: error.message };
    }

    if (data.user) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Auto sign-in error:', signInError);
      }

      await this.fetchUserProfile(email);
    }

    return { success: true };
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    this.userSignal.set(null);
  }

  async updateProfile(
    updates: Partial<User>,
  ): Promise<{ success: boolean; error?: string }> {
    const currentUser = this.userSignal();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('users')
      .update({
        full_name: updates.fullName,
        phone: updates.phone,
        address: updates.address,
        avatar_url: updates.avatarUrl,
        payment_qr_url: updates.paymentQrUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('email', currentUser.email); // ✅ update bằng email thay vì id

    if (error) {
      return { success: false, error: error.message };
    }

    this.userSignal.set({ ...currentUser, ...updates });
    return { success: true };
  }
}