export type DeliveryZone = {
  id: number;
  state: string;
  zoneNumber: number;
  zoneName: string;
  fee: number;
  locations: string[];
  partnerId: number | null;
  partnerName: string | null;
};

export type DeliveryPartner = {
  id: number;
  name: string;
  contactName: string | null;
  phone: string | null;
  state: string;
  active: boolean;
  zones: DeliveryZone[];
};

export const OTHER_STATES_FEE = 5000;
