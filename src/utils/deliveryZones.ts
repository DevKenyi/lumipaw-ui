export type Zone = {
  name: string;
  fee: number;
  locations: string[];
};

export const DELIVERY_ZONES: Record<string, Zone[]> = {
  Lagos: [
    {
      name: 'Zone 1 – Island & Waterfront',
      fee: 1500,
      locations: [
        'Victoria Island', 'Ikoyi', 'Lekki Phase 1', 'Lagos Island',
        'Onikan', 'Eko Atlantic', 'Banana Island',
      ],
    },
    {
      name: 'Zone 2 – Inner Mainland',
      fee: 2000,
      locations: [
        'Ikeja', 'Maryland', 'Yaba', 'Surulere', 'Gbagada',
        'Ojota', 'Palmgrove', 'Anthony Village', 'Agidingbi', 'Allen',
      ],
    },
    {
      name: 'Zone 3 – Outer Mainland',
      fee: 2500,
      locations: [
        'Ajah', 'Sangotedo', 'Abraham Adesanya', 'Lekki Phase 2',
        'Chevron', 'VGC', 'Agege', 'Oshodi', 'Mushin', 'Isolo',
        'Ogba', 'Ketu', 'Mile 2', 'Festac',
      ],
    },
    {
      name: 'Zone 4 – Far Outskirts',
      fee: 3500,
      locations: ['Ikorodu', 'Epe', 'Badagry', 'Agbara', 'Mowe', 'Ibafo'],
    },
  ],

  Abuja: [
    {
      name: 'Zone 1 – Central Abuja',
      fee: 1500,
      locations: [
        'Maitama', 'Asokoro', 'Wuse', 'Wuse 2', 'Garki',
        'Central Business District', 'Diplomatic Zone', 'Aso Drive',
      ],
    },
    {
      name: 'Zone 2 – Inner Suburbs',
      fee: 2000,
      locations: [
        'Gwarinpa', 'Jabi', 'Kado', 'Katampe', 'Utako',
        'Life Camp', 'Durumi', 'Gudu', 'Wuse Extension', 'Dawaki',
      ],
    },
    {
      name: 'Zone 3 – Outer Suburbs',
      fee: 2500,
      locations: [
        'Kubwa', 'Lugbe', 'Lokogoma', 'Apo', 'Galadimawa',
        'Dakibiyu', 'Karmo', 'Nyanya', 'Karu', 'Gwagwa',
      ],
    },
    {
      name: 'Zone 4 – Satellite Towns',
      fee: 3500,
      locations: [
        'Gwagwalada', 'Bwari', 'Abaji', 'Kwali', 'Kuje',
        'Mpape', 'Zuba', 'Idu', 'Dei-Dei',
      ],
    },
  ],
};

export const OTHER_STATES_FEE = 5000;

export function isZonedState(state: string): boolean {
  return state in DELIVERY_ZONES;
}

export function getDeliveryFee(state: string, location: string): number {
  const zones = DELIVERY_ZONES[state];
  if (!zones) return OTHER_STATES_FEE;
  for (const zone of zones) {
    if (zone.locations.includes(location)) return zone.fee;
  }
  return OTHER_STATES_FEE;
}
