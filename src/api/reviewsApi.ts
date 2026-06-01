import api from './axios';
import type { ApiResponse, PageResponse, Review } from '../types';

export const reviewsApi = {
  getByProduct: (productId: string, params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Review>>>(`/api/products/${productId}/reviews`, { params }),

  submit: (productId: string, data: { rating: number; comment?: string }) =>
    api.post<ApiResponse<Review>>(`/api/products/${productId}/reviews`, data),
};
