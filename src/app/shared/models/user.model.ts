export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}