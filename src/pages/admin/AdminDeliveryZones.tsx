import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { deliveryZonesApi, deliveryPartnersApi } from '../../api/deliveryZonesApi';
import AdminLayout from '../../components/layout/AdminLayout';
import { formatNGN } from '../../utils/format';
import type { DeliveryPartner } from '../../utils/deliveryZones';
import Spinner from '../../components/ui/Spinner';

const NIGERIAN_STATES = [
  'Abuja','Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa',
  'Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger',
  'Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

const EMPTY_PARTNER = { name: '', contactName: '', phone: '', state: 'Abuja' };
const EMPTY_ZONE = { zoneName: '', fee: '', locations: '' };

export default function AdminDeliveryZones() {
  const qc = useQueryClient();
  const [expandedPartner, setExpandedPartner] = useState<number | null>(null);
  const [editingFee, setEditingFee] = useState<{ id: number; fee: string } | null>(null);
  const [addingPartner, setAddingPartner] = useState(false);
  const [partnerForm, setPartnerForm] = useState(EMPTY_PARTNER);
  const [addingZoneTo, setAddingZoneTo] = useState<number | null>(null);
  const [zoneForm, setZoneForm] = useState(EMPTY_ZONE);

  const { data, isLoading } = useQuery({
    queryKey: ['delivery-partners'],
    queryFn: () => deliveryPartnersApi.list(),
  });

  const createPartnerMutation = useMutation({
    mutationFn: (d: typeof EMPTY_PARTNER) => deliveryPartnersApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery-partners'] }); toast.success('Partner added'); setAddingPartner(false); setPartnerForm(EMPTY_PARTNER); },
    onError: () => toast.error('Failed to add partner'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => deliveryPartnersApi.toggle(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery-partners'] }); qc.invalidateQueries({ queryKey: ['delivery-zones'] }); },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: (id: number) => deliveryPartnersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery-partners'] }); qc.invalidateQueries({ queryKey: ['delivery-zones'] }); toast.success('Partner deleted'); },
  });

  const addZoneMutation = useMutation({
    mutationFn: ({ partnerId, data }: { partnerId: number; data: { zoneName: string; fee: number; locations: string[] } }) =>
      deliveryPartnersApi.addZone(partnerId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery-partners'] }); qc.invalidateQueries({ queryKey: ['delivery-zones'] }); toast.success('Zone added'); setAddingZoneTo(null); setZoneForm(EMPTY_ZONE); },
    onError: () => toast.error('Failed to add zone'),
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ id, fee }: { id: number; fee: number }) => deliveryZonesApi.updateFee(id, fee),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery-partners'] }); qc.invalidateQueries({ queryKey: ['delivery-zones'] }); toast.success('Fee updated'); setEditingFee(null); },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: (id: number) => deliveryZonesApi.deleteZone(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery-partners'] }); qc.invalidateQueries({ queryKey: ['delivery-zones'] }); toast.success('Zone deleted'); },
  });

  const handleAddZone = (partnerId: number) => {
    const locations = zoneForm.locations.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!zoneForm.zoneName || !zoneForm.fee || locations.length === 0) { toast.error('Fill in all zone fields'); return; }
    addZoneMutation.mutate({ partnerId, data: { zoneName: zoneForm.zoneName, fee: Number(zoneForm.fee), locations } });
  };

  const partners: DeliveryPartner[] = data?.data.data ?? [];
  const grouped = partners.reduce<Record<string, DeliveryPartner[]>>((acc, p) => {
    (acc[p.state] ??= []).push(p);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Partners</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage delivery companies and their coverage zones. Active partners are visible at checkout.</p>
        </div>
        <button onClick={() => setAddingPartner(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add partner
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([state, statePartners]) => (
            <div key={state}>
              <h2 className="text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">{state}</h2>
              <div className="space-y-3">
                {statePartners.map((partner) => (
                  <div key={partner.id} className={`card overflow-hidden ${!partner.active ? 'opacity-60' : ''}`}>
                    {/* Partner header */}
                    <div className="flex items-center justify-between gap-3 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{partner.name}</p>
                          {!partner.active && (
                            <span className="badge bg-gray-100 text-gray-500 text-xs">Inactive</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {partner.contactName && `${partner.contactName}`}
                          {partner.phone && ` · ${partner.phone}`}
                          {` · ${partner.zones.length} zone${partner.zones.length !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleMutation.mutate(partner.id)}
                          className={`p-1.5 rounded-lg transition-colors ${partner.active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                          title={partner.active ? 'Deactivate' : 'Activate'}
                        >
                          {partner.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete ${partner.name} and all their zones?`)) deletePartnerMutation.mutate(partner.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setExpandedPartner(expandedPartner === partner.id ? null : partner.id)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {expandedPartner === partner.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Zones */}
                    {expandedPartner === partner.id && (
                      <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                        {partner.zones.map((zone) => (
                          <div key={zone.id} className="p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <p className="text-sm font-semibold text-gray-800">{zone.zoneName}</p>
                              <div className="flex items-center gap-2 shrink-0">
                                {editingFee?.id === zone.id ? (
                                  <>
                                    <span className="text-sm text-gray-500">₦</span>
                                    <input
                                      type="number" value={editingFee.fee}
                                      onChange={(e) => setEditingFee({ ...editingFee, fee: e.target.value })}
                                      className="input w-24 text-sm py-1" autoFocus
                                    />
                                    <button onClick={() => updateFeeMutation.mutate({ id: zone.id, fee: Number(editingFee.fee) })}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="h-4 w-4" /></button>
                                    <button onClick={() => setEditingFee(null)}
                                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="h-4 w-4" /></button>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-bold text-brand-700">{formatNGN(zone.fee)}</span>
                                    <button onClick={() => setEditingFee({ id: zone.id, fee: String(zone.fee) })}
                                      className="p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded">
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => { if (confirm('Delete this zone?')) deleteZoneMutation.mutate(zone.id); }}
                                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {zone.locations.map((loc) => (
                                <span key={loc} className="badge bg-white border border-gray-200 text-gray-600 text-xs">{loc}</span>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Add zone */}
                        {addingZoneTo === partner.id ? (
                          <div className="p-3 border-2 border-dashed border-brand-300 rounded-xl space-y-3 bg-brand-50">
                            <p className="text-sm font-semibold text-brand-700">New zone</p>
                            <input
                              placeholder="Zone name (e.g. City Centre)"
                              value={zoneForm.zoneName}
                              onChange={(e) => setZoneForm((f) => ({ ...f, zoneName: e.target.value }))}
                              className="input text-sm"
                            />
                            <input
                              type="number" placeholder="Fee (₦)"
                              value={zoneForm.fee}
                              onChange={(e) => setZoneForm((f) => ({ ...f, fee: e.target.value }))}
                              className="input text-sm" min="0"
                            />
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Locations — one per line</label>
                              <textarea
                                placeholder={"Wuse 2\nMaitama\nAsokoro"}
                                value={zoneForm.locations}
                                onChange={(e) => setZoneForm((f) => ({ ...f, locations: e.target.value }))}
                                className="input text-sm resize-none" rows={5}
                              />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { setAddingZoneTo(null); setZoneForm(EMPTY_ZONE); }} className="btn-secondary flex-1 text-sm py-1.5">Cancel</button>
                              <button onClick={() => handleAddZone(partner.id)} disabled={addZoneMutation.isPending}
                                className="btn-primary flex-1 text-sm py-1.5">
                                {addZoneMutation.isPending ? 'Saving…' : 'Add zone'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setAddingZoneTo(partner.id); setZoneForm(EMPTY_ZONE); }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors"
                          >
                            <Plus className="h-4 w-4" /> Add zone
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {partners.length === 0 && (
            <div className="card p-12 text-center text-gray-400">No delivery partners yet. Add one to get started.</div>
          )}
        </div>
      )}

      {/* Add partner modal */}
      {addingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 mb-4">New delivery partner</h3>
            <div className="space-y-3">
              <input placeholder="Company name *" value={partnerForm.name}
                onChange={(e) => setPartnerForm((f) => ({ ...f, name: e.target.value }))} className="input" />
              <input placeholder="Contact person" value={partnerForm.contactName}
                onChange={(e) => setPartnerForm((f) => ({ ...f, contactName: e.target.value }))} className="input" />
              <input placeholder="Phone number" value={partnerForm.phone}
                onChange={(e) => setPartnerForm((f) => ({ ...f, phone: e.target.value }))} className="input" />
              <select value={partnerForm.state} onChange={(e) => setPartnerForm((f) => ({ ...f, state: e.target.value }))} className="input">
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setAddingPartner(false); setPartnerForm(EMPTY_PARTNER); }} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => createPartnerMutation.mutate(partnerForm)}
                disabled={!partnerForm.name || createPartnerMutation.isPending}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {createPartnerMutation.isPending ? 'Saving…' : 'Add partner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
