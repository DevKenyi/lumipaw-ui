import api from './axios';
import type { ApiResponse } from '../types';
import type { DeliveryZone } from '../utils/deliveryZones';

export const deliveryZonesApi = {
  getAll: () =>
    api.get<ApiResponse<Record<string, DeliveryZone[]>>>('/api/delivery-zones'),

  updateFee: (id: number, fee: number) =>
    api.put<ApiResponse<DeliveryZone>>(`/api/admin/delivery-zones/${id}`, { fee }),
};
