import api from './axios';
import type { ApiResponse, PageResponse, Product, ProductInput, Vendor } from '../types';

export interface BulkPreviewItem {
  action: 'NEW' | 'UPDATE';
  id: string | null;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  error: string | null;
}

export interface BulkUploadPreviewResponse {
  newCount: number;
  updateCount: number;
  errorCount: number;
  items: BulkPreviewItem[];
}

export interface BulkUploadConfirmResponse {
  created: number;
  updated: number;
}

export const vendorApi = {
  getProfile: () =>
    api.get<ApiResponse<Vendor>>('/api/vendor/profile'),

  myProducts: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Product>>>('/api/vendor/products', { params }),

  submitProduct: (data: ProductInput) =>
    api.post<ApiResponse<Product>>('/api/vendor/products', data),

  resubmitProduct: (id: string, data: ProductInput) =>
    api.put<ApiResponse<Product>>(`/api/vendor/products/${id}`, data),

  editProduct: (id: string, data: ProductInput) =>
    api.patch<ApiResponse<Product>>(`/api/vendor/products/${id}`, data),

  downloadBulkTemplate: () =>
    api.get('/api/vendor/products/bulk/template', { responseType: 'blob' }),

  bulkPreview: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ApiResponse<BulkUploadPreviewResponse>>('/api/vendor/products/bulk/preview', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  bulkConfirm: (rows: BulkPreviewItem[]) =>
    api.post<ApiResponse<BulkUploadConfirmResponse>>('/api/vendor/products/bulk/confirm', {
      rows: rows.map((r) => ({
        id: r.id ?? '',
        name: r.name,
        description: r.description,
        category: r.category,
        price: r.price,
        stock: r.stock,
        imageUrl: r.imageUrl,
      })),
    }),
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

  approveProduct: (id: string, body?: { price?: number; variantPrices?: { id: string; price: number }[] }) =>
    api.post<ApiResponse<Product>>(`/api/admin/products/${id}/approve`, body ?? {}),

  rejectProduct: (id: string, reason: string) =>
    api.post<ApiResponse<Product>>(`/api/admin/products/${id}/reject`, { reason }),
};

export const publicVendorsApi = {
  list: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Vendor>>>('/api/vendors', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Vendor>>(`/api/vendors/${id}`),

  getProducts: (id: string, params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Product>>>(`/api/vendors/${id}/products`, { params }),
};

export const authVendorApi = {
  register: (data: { email: string; password: string; businessName: string; description?: string; phone?: string }) =>
    api.post<ApiResponse<{ token: string; role: string; firstName: string }>>('/api/auth/register-vendor', data),
};
