import api from './axios';
import type { ApiResponse, PageResponse, Order } from '../types';

export const ordersApi = {
  create: (data: { items: { productId: string; variantId?: string | null; quantity: number }[]; deliveryAddress?: string; deliveryCity?: string; deliveryState?: string; phone?: string; alternatePhone?: string; notes?: string; paymentMethod?: string; preferredDeliveryDate?: string }) =>
    api.post<ApiResponse<Order>>('/api/orders', data),

  myOrders: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Order>>>('/api/orders', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/api/orders/${id}`),

  // Admin
  adminList: (params?: { page?: number; size?: number; status?: string; paymentStatus?: string }) =>
    api.get<ApiResponse<PageResponse<Order>>>('/api/admin/orders', { params }),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<Order>>(`/api/admin/orders/${id}/status`, { status }),

  confirmPodPayment: (id: string) =>
    api.post<ApiResponse<Order>>(`/api/admin/orders/${id}/confirm-pod-payment`),
};
