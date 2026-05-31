import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { ordersApi } from '../api/orders';
import { paymentsApi } from '../api/payments';
import { deliveryZonesApi } from '../api/deliveryZonesApi';
import { formatNGN } from '../utils/format';
import { OTHER_STATES_FEE } from '../utils/deliveryZones';
import ProductImage from '../components/ui/ProductImage';
import Spinner from '../components/ui/Spinner';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'Abuja', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export default function Checkout() {
  const { items, subtotal } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    deliveryAddress: '', deliveryCity: '', deliveryState: '', notes: '',
  });

  const { data: zonesData, isLoading: zonesLoading } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: () => deliveryZonesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const zones = zonesData?.data.data ?? {};

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((f) => ({ ...f, deliveryState: e.target.value, deliveryCity: '' }));
  };

  const isZoned = form.deliveryState in zones;

  const deliveryFee = (() => {
    if (!form.deliveryState) return 0;
    const stateZones = zones[form.deliveryState];
    if (!stateZones) return OTHER_STATES_FEE;
    if (!form.deliveryCity) return 0;
    for (const zone of stateZones) {
      if (zone.locations.includes(form.deliveryCity)) return zone.fee;
    }
    return OTHER_STATES_FEE;
  })();

  const sub = subtotal();
  const serviceFee = Math.round(sub * 0.05);
  const total = sub + serviceFee + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    try {
      const orderRes = await ordersApi.create({
        items: items.map((i) => ({
          productId: i.product.id,
          variantId: i.variant?.id ?? null,
          quantity: i.quantity,
        })),
        ...form,
      });
      const orderId = orderRes.data.data.id;
      const payRes = await paymentsApi.initialize(orderId);
      const { authorizationUrl } = payRes.data.data;
      window.location.href = authorizationUrl;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Checkout failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery address</label>
                <input value={form.deliveryAddress} onChange={set('deliveryAddress')} className="input"
                  placeholder="House number, street name" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                  <select value={form.deliveryState} onChange={handleStateChange} className="input" required>
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  {zonesLoading && form.deliveryState ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner size="sm" />
                    </div>
                  ) : isZoned ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Area / Location</label>
                      <select value={form.deliveryCity} onChange={set('deliveryCity')} className="input" required>
                        <option value="">Select area</option>
                        {zones[form.deliveryState].map((zone) => (
                          <optgroup key={zone.id} label={`${zone.zoneName} — ${formatNGN(zone.fee)}`}>
                            {zone.locations.map((loc) => (
                              <option key={loc} value={loc}>{loc}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                      <input value={form.deliveryCity} onChange={set('deliveryCity')} className="input"
                        placeholder="e.g. Port Harcourt" required />
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Order notes (optional)</label>
                <textarea value={form.notes} onChange={set('notes')} className="input resize-none" rows={2}
                  placeholder="Any special delivery instructions?" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-semibold text-green-800 text-sm">Secured by Flutterwave</p>
                <p className="text-xs text-green-600">Your card details are encrypted and never stored</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">You'll be redirected to Flutterwave to complete payment securely.</p>
          </div>

          <button type="submit" disabled={loading || items.length === 0} className="btn-primary w-full text-base py-4">
            {loading ? 'Processing…' : deliveryFee > 0 ? `Pay ${formatNGN(total)} securely` : 'Select delivery area to continue'}
          </button>
        </form>

        {/* Order summary */}
        <div className="card p-6 h-fit lg:sticky lg:top-24 order-1 lg:order-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your order</h2>
          <div className="space-y-3 mb-4">
            {items.map(({ product, variant, quantity }) => {
              const price = variant ? variant.price : product.price;
              return (
                <div key={`${product.id}:${variant?.id ?? 'base'}`} className="flex gap-3">
                  <ProductImage src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    {variant && <p className="text-xs text-brand-600">{variant.label}</p>}
                    <p className="text-xs text-gray-500">×{quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 shrink-0">{formatNGN(price * quantity)}</p>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>{formatNGN(sub)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Service fee (5%)</span><span>{formatNGN(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              {deliveryFee > 0
                ? <span>{formatNGN(deliveryFee)}</span>
                : <span className="text-gray-400 italic text-xs">Select area</span>
              }
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>{formatNGN(total)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
