import api from './axios';
import type { ApiResponse, PageResponse, Product, ProductInput } from '../types';

export const productsApi = {
  list: (params?: { category?: string; search?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Product>>>('/api/products', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Product>>(`/api/products/${id}`),

  getCategories: () =>
    api.get<ApiResponse<string[]>>('/api/products/categories'),

  // Admin
  adminList: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Product>>>('/api/admin/products', { params }),

  create: (data: ProductInput) =>
    api.post<ApiResponse<Product>>('/api/admin/products', data),

  update: (id: string, data: ProductInput) =>
    api.put<ApiResponse<Product>>(`/api/admin/products/${id}`, data),

  toggleActive: (id: string) =>
    api.patch<ApiResponse<Product>>(`/api/admin/products/${id}/toggle-active`),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/admin/products/${id}`),
};
