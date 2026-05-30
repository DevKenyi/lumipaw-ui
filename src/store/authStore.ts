import { create } from 'zustand';
import type { LoginResponse } from '../types';

interface AuthState {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const stored = localStorage.getItem('lp_user');

export const useAuthStore = create<AuthState>((set) => ({
  user: stored ? JSON.parse(stored) : null,
  isAuthenticated: !!localStorage.getItem('lp_token'),
  isAdmin: stored ? JSON.parse(stored).role === 'ADMIN' : false,

  login: (data) => {
    localStorage.setItem('lp_token', data.token);
    localStorage.setItem('lp_user', JSON.stringify(data));
    set({ user: data, isAuthenticated: true, isAdmin: data.role === 'ADMIN' });
  },

  logout: () => {
    localStorage.removeItem('lp_token');
    localStorage.removeItem('lp_user');
    set({ user: null, isAuthenticated: false, isAdmin: false });
  },
}));
