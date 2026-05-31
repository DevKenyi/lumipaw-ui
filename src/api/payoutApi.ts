import api from './axios';
import type { ApiResponse, PageResponse } from '../types';

export interface VendorPayoutRecord {
  id: string;
  orderId: string;
  vendorId: string;
  vendorBusinessName: string | null;
  productName: string;
  grossAmount: number;
  platformFeePct: number;
  platformFee: number;
  netAmount: number;
  status: 'PENDING' | 'PAID';
  paidAt: string | null;
  createdAt: string;
}

export interface VendorEarningsSummary {
  totalGross: number;
  totalFees: number;
  totalNet: number;
  pendingNet: number;
  paidNet: number;
  pendingCount: number;
  paidCount: number;
}

export interface AdminPayoutSummary {
  totalPlatformRevenue: number;
  pendingPayouts: number;
  paidPayouts: number;
  currentFeePct: number;
}

export const vendorEarningsApi = {
  list: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<VendorPayoutRecord>>>('/api/vendor/earnings', { params }),
  summary: () =>
    api.get<ApiResponse<VendorEarningsSummary>>('/api/vendor/earnings/summary'),
};

export const adminPayoutsApi = {
  list: (params?: { status?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<VendorPayoutRecord>>>('/api/admin/payouts', { params }),
  summary: () =>
    api.get<ApiResponse<AdminPayoutSummary>>('/api/admin/payouts/summary'),
  markPaid: (id: string) =>
    api.patch<ApiResponse<VendorPayoutRecord>>(`/api/admin/payouts/${id}/mark-paid`),
  getFeePct: () =>
    api.get<ApiResponse<number>>('/api/admin/config/platform-fee'),
  updateFeePct: (feePct: number) =>
    api.put<ApiResponse<number>>('/api/admin/config/platform-fee', { feePct }),
};
