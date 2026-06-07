import api from './axios';
import type { ApiResponse } from '../types';
import type { DeliveryZone, DeliveryPartner } from '../utils/deliveryZones';

export const deliveryZonesApi = {
  getAll: () =>
    api.get<ApiResponse<Record<string, DeliveryZone[]>>>('/api/delivery-zones'),

  updateFee: (id: number, fee: number) =>
    api.put<ApiResponse<DeliveryZone>>(`/api/admin/delivery-zones/${id}`, { fee }),

  deleteZone: (id: number) =>
    api.delete<ApiResponse<void>>(`/api/admin/delivery-zones/${id}`),
};

export const deliveryPartnersApi = {
  list: () =>
    api.get<ApiResponse<DeliveryPartner[]>>('/api/admin/delivery-partners'),

  create: (data: { name: string; contactName: string; phone: string; state: string }) =>
    api.post<ApiResponse<DeliveryPartner>>('/api/admin/delivery-partners', data),

  toggle: (id: number) =>
    api.patch<ApiResponse<DeliveryPartner>>(`/api/admin/delivery-partners/${id}/toggle`),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/api/admin/delivery-partners/${id}`),

  addZone: (partnerId: number, data: { zoneName: string; fee: number; locations: string[] }) =>
    api.post<ApiResponse<DeliveryPartner>>(`/api/admin/delivery-partners/${partnerId}/zones`, data),
};
