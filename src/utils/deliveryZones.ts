export type DeliveryZone = {
  id: number;
  state: string;
  zoneNumber: number;
  zoneName: string;
  fee: number;
  locations: string[];
};

export const OTHER_STATES_FEE = 5000;
