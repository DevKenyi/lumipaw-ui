import api from './axios';
import type { ApiResponse, Customer, DashboardStats, PageResponse } from '../types';

export const customersApi = {
  getMe: () =>
    api.get<ApiResponse<Customer>>('/api/customers/me'),

  updateMe: (data: Partial<Customer>) =>
    api.put<ApiResponse<Customer>>('/api/customers/me', data),

  // Admin
  list: (params?: { page?: number; size?: number; search?: string }) =>
    api.get<ApiResponse<PageResponse<Customer>>>('/api/admin/customers', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Customer>>(`/api/admin/customers/${id}`),

  dashboard: () =>
    api.get<ApiResponse<DashboardStats>>('/api/admin/dashboard'),
};
