import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { ordersApi } from '../api/orders';
import { paymentsApi } from '../api/payments';
import { formatNGN } from '../utils/format';

const DELIVERY_FEE = 1500;
const SERVICE_FEE = 200;

export default function Checkout() {
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    deliveryAddress: '', deliveryCity: '', deliveryState: '', notes: '',
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const sub = subtotal();
  const total = sub + DELIVERY_FEE + SERVICE_FEE;

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

      clearCart();
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
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery address</label>
                <input value={form.deliveryAddress} onChange={set('deliveryAddress')} className="input" placeholder="12 Admiralty Way, Lekki" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input value={form.deliveryCity} onChange={set('deliveryCity')} className="input" placeholder="Lagos" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                  <select value={form.deliveryState} onChange={set('deliveryState')} className="input" required>
                    <option value="">Select state</option>
                    {['Lagos', 'Abuja', 'Rivers', 'Oyo', 'Kano', 'Kaduna', 'Anambra', 'Ogun', 'Delta', 'Edo'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Order notes (optional)</label>
                <textarea value={form.notes} onChange={set('notes')} className="input resize-none" rows={2} placeholder="Any special delivery instructions?" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-semibold text-green-800 text-sm">Secured by Paystack</p>
                <p className="text-xs text-green-600">Your card details are encrypted and never stored</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">You'll be redirected to Paystack to complete payment securely.</p>
          </div>

          <button type="submit" disabled={loading || items.length === 0} className="btn-primary w-full text-base py-4">
            {loading ? 'Processing…' : `Pay ${formatNGN(total)} securely`}
          </button>
        </form>

        {/* Order summary */}
        <div className="card p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your order</h2>
          <div className="space-y-3 mb-4">
            {items.map(({ product, variant, quantity }) => {
              const price = variant ? variant.price : product.price;
              return (
                <div key={`${product.id}:${variant?.id ?? 'base'}`} className="flex gap-3">
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0" />
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
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatNGN(sub)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{formatNGN(DELIVERY_FEE)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Service fee</span><span>{formatNGN(SERVICE_FEE)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total</span><span>{formatNGN(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
