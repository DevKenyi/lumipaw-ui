import { create } from 'zustand';
import type { LoginResponse } from '../types';

interface AuthState {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const stored = localStorage.getItem('lp_user');
const storedUser: LoginResponse | null = stored ? JSON.parse(stored) : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  isAuthenticated: !!localStorage.getItem('lp_token'),
  isAdmin: storedUser?.role === 'ADMIN',
  isVendor: storedUser?.role === 'VENDOR',

  login: (data) => {
    localStorage.setItem('lp_token', data.token);
    localStorage.setItem('lp_user', JSON.stringify(data));
    set({
      user: data,
      isAuthenticated: true,
      isAdmin: data.role === 'ADMIN',
      isVendor: data.role === 'VENDOR',
    });
  },

  logout: () => {
    localStorage.removeItem('lp_token');
    localStorage.removeItem('lp_user');
    set({ user: null, isAuthenticated: false, isAdmin: false, isVendor: false });
  },
}));
