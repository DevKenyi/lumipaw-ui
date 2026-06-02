import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { ordersApi } from '../api/orders';
import { paymentsApi } from '../api/payments';
import { deliveryZonesApi } from '../api/deliveryZonesApi';
import { formatNGN } from '../utils/format';
import { OTHER_STATES_FEE } from '../utils/deliveryZones';
import ProductImage from '../components/ui/ProductImage';
import DatePicker from '../components/ui/DatePicker';
import Spinner from '../components/ui/Spinner';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'Abuja', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

type PaymentMethod = 'ONLINE' | 'PAY_ON_DELIVERY';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const [podConfirmed, setPodConfirmed] = useState(false);
  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState('');
  const [form, setForm] = useState({
    deliveryAddress: '', deliveryCity: '', deliveryState: '',
    phone: '', alternatePhone: '', notes: '',
  });

  const minDeliveryDate = new Date();
  minDeliveryDate.setDate(minDeliveryDate.getDate() + 1);
  const minDateStr = minDeliveryDate.toISOString().split('T')[0];

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

  const isPod = paymentMethod === 'PAY_ON_DELIVERY';
  const canSubmit = deliveryFee > 0 && (!isPod || (podConfirmed && !!preferredDeliveryDate));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !canSubmit) return;
    setLoading(true);
    try {
      const orderRes = await ordersApi.create({
        items: items.map((i) => ({
          productId: i.product.id,
          variantId: i.variant?.id ?? null,
          quantity: i.quantity,
        })),
        ...form,
        paymentMethod,
        preferredDeliveryDate: preferredDeliveryDate || undefined,
      });
      const orderId = orderRes.data.data.id;

      if (isPod) {
        clearCart();
        toast.success('Order placed! Pay the rider on delivery.');
        navigate(`/orders/${orderId}`);
      } else {
        const payRes = await paymentsApi.initialize(orderId);
        const { authorizationUrl } = payRes.data.data;
        window.location.href = authorizationUrl;
      }
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                  <input value={form.phone} onChange={set('phone')} className="input"
                    placeholder="08012345678" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alternate phone <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input value={form.alternatePhone} onChange={set('alternatePhone')} className="input"
                    placeholder="08087654321" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Order notes (optional)</label>
                <textarea value={form.notes} onChange={set('notes')} className="input resize-none" rows={2}
                  placeholder="Any special delivery instructions?" />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setPaymentMethod('ONLINE'); setPodConfirmed(false); }}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                  paymentMethod === 'ONLINE'
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mt-0.5">🔒</span>
                <div>
                  <p className={`font-semibold text-sm ${paymentMethod === 'ONLINE' ? 'text-brand-700' : 'text-gray-800'}`}>
                    Pay Online
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Card, bank transfer, USSD via Flutterwave</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('PAY_ON_DELIVERY')}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                  paymentMethod === 'PAY_ON_DELIVERY'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mt-0.5">🏠</span>
                <div>
                  <p className={`font-semibold text-sm ${paymentMethod === 'PAY_ON_DELIVERY' ? 'text-amber-700' : 'text-gray-800'}`}>
                    Pay on Delivery
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Cash or bank transfer to rider</p>
                </div>
              </button>
            </div>

            {paymentMethod === 'ONLINE' && (
              <p className="text-sm text-gray-500 mt-3">You'll be redirected to Flutterwave to complete payment securely.</p>
            )}

            {paymentMethod === 'PAY_ON_DELIVERY' && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-amber-800">Before you continue</p>
                </div>
                <ul className="text-sm text-amber-700 space-y-1.5 mb-4 list-disc list-inside">
                  <li>You must be available at the delivery address to receive your order.</li>
                  <li>Have the full amount ready in cash <span className="font-medium">or</span> be ready to make an instant bank transfer to the rider.</li>
                  <li>Your order will only be completed once payment is received. Failure to pay will result in the order being returned.</li>
                </ul>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-amber-800 mb-1.5">
                    When would you like your order delivered? <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    value={preferredDeliveryDate}
                    onChange={setPreferredDeliveryDate}
                    min={minDateStr}
                  />
                  <p className="text-xs text-amber-600 mt-1.5">
                    We'll send you a reminder the day before your chosen date.
                  </p>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={podConfirmed}
                    onChange={(e) => setPodConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-amber-800 font-medium">
                    I confirm I will be available and ready to pay{deliveryFee > 0 ? ` ${formatNGN(total)}` : ''} on delivery.
                  </span>
                </label>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0 || !canSubmit}
            className="btn-primary w-full text-base py-4 disabled:opacity-50"
          >
            {loading
              ? 'Processing…'
              : !deliveryFee
              ? 'Select delivery area to continue'
              : isPod && !preferredDeliveryDate
              ? 'Choose a delivery date to continue'
              : isPod && !podConfirmed
              ? 'Confirm the checkbox above to continue'
              : isPod
              ? `Place order — pay ${formatNGN(total)} on delivery`
              : `Pay ${formatNGN(total)} securely`}
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
