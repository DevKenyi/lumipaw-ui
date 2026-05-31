import api from './axios';
import type { ApiResponse, InitializePaymentResponse } from '../types';

export const paymentsApi = {
  initialize: (orderId: string) =>
    api.post<ApiResponse<InitializePaymentResponse>>('/api/payments/initialize', { orderId }),

  verify: (transactionId: string) =>
    api.post<ApiResponse<void>>('/api/payments/verify', { transactionId }),
};
