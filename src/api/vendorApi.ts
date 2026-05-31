import api from './axios';
import type { ApiResponse, PageResponse, Product, ProductInput, Vendor } from '../types';

export const vendorApi = {
  getProfile: () =>
    api.get<ApiResponse<Vendor>>('/api/vendor/profile'),

  myProducts: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Product>>>('/api/vendor/products', { params }),

  submitProduct: (data: ProductInput) =>
    api.post<ApiResponse<Product>>('/api/vendor/products', data),

  resubmitProduct: (id: string, data: ProductInput) =>
    api.put<ApiResponse<Product>>(`/api/vendor/products/${id}`, data),
};

export const adminVendorApi = {
  list: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Vendor>>>('/api/admin/vendors', { params }),

  activate: (id: string) =>
    api.post<ApiResponse<Vendor>>(`/api/admin/vendors/${id}/activate`),

  deactivate: (id: string) =>
    api.post<ApiResponse<Vendor>>(`/api/admin/vendors/${id}/deactivate`),

  pendingProducts: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Product>>>('/api/admin/products/pending', { params }),

  approveProduct: (id: string) =>
    api.post<ApiResponse<Product>>(`/api/admin/products/${id}/approve`),

  rejectProduct: (id: string, reason: string) =>
    api.post<ApiResponse<Product>>(`/api/admin/products/${id}/reject`, { reason }),
};

export const authVendorApi = {
  register: (data: { email: string; password: string; businessName: string; description?: string; phone?: string }) =>
    api.post<ApiResponse<{ token: string; role: string; firstName: string }>>('/api/auth/register-vendor', data),
};
