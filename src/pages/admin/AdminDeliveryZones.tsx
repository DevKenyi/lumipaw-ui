import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { deliveryZonesApi } from '../../api/deliveryZonesApi';
import AdminLayout from '../../components/layout/AdminLayout';
import { formatNGN } from '../../utils/format';
import { OTHER_STATES_FEE } from '../../utils/deliveryZones';
import Spinner from '../../components/ui/Spinner';

export default function AdminDeliveryZones() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<{ id: number; fee: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: () => deliveryZonesApi.getAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fee }: { id: number; fee: number }) => deliveryZonesApi.updateFee(id, fee),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery-zones'] });
      toast.success('Delivery fee updated');
      setEditing(null);
    },
    onError: () => toast.error('Failed to update fee'),
  });

  const zones = data?.data.data ?? {};
  const states = Object.keys(zones);

  const handleSave = () => {
    if (!editing) return;
    const fee = parseInt(editing.fee, 10);
    if (isNaN(fee) || fee < 0) { toast.error('Enter a valid fee'); return; }
    updateMutation.mutate({ id: editing.id, fee });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
        <p className="text-gray-500 mt-1">Manage delivery fees per zone. Other states are charged a flat {formatNGN(OTHER_STATES_FEE)}.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-8">
          {states.map((state) => (
            <div key={state}>
              <h2 className="text-lg font-bold text-gray-800 mb-3">{state}</h2>
              <div className="space-y-3">
                {zones[state].map((zone) => (
                  <div key={zone.id} className="card p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{zone.zoneName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{zone.locations.length} locations</p>
                      </div>

                      {editing?.id === zone.id ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm text-gray-500">₦</span>
                          <input
                            type="number"
                            value={editing.fee}
                            onChange={(e) => setEditing({ ...editing, fee: e.target.value })}
                            className="input w-28 text-sm py-1.5"
                            min="0"
                            autoFocus
                          />
                          <button onClick={handleSave} disabled={updateMutation.isPending}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditing(null)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-lg font-bold text-brand-700">{formatNGN(zone.fee)}</span>
                          <button onClick={() => setEditing({ id: zone.id, fee: String(zone.fee) })}
                            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {zone.locations.map((loc) => (
                        <span key={loc} className="badge bg-gray-100 text-gray-600 text-xs">{loc}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 card p-5 border-dashed">
        <p className="text-sm font-semibold text-gray-700">All other states</p>
        <p className="text-xs text-gray-400 mt-0.5">Rivers, Oyo, Kano, Kaduna and every other state not listed above</p>
        <p className="text-lg font-bold text-gray-900 mt-2">{formatNGN(OTHER_STATES_FEE)} <span className="text-xs font-normal text-gray-400">flat rate</span></p>
      </div>
    </AdminLayout>
  );
}
