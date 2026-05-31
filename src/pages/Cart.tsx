import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatNGN } from '../utils/format';
import EmptyState from '../components/ui/EmptyState';
import ProductImage from '../components/ui/ProductImage';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const sub = subtotal();
  const serviceFee = Math.round(sub * 0.05);
  const total = sub + serviceFee;

  const handleCheckout = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <EmptyState
          title="Your cart is empty"
          description="Add some products to get started"
          action={<Link to="/products" className="btn-primary">Browse products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, variant, quantity }) => {
            const price = variant ? variant.price : product.price;
            return (
              <div key={`${product.id}:${variant?.id ?? 'base'}`} className="card p-4 flex gap-4">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-gray-50 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-0.5 truncate">{product.name}</h3>
                  {variant && (
                    <p className="text-xs text-brand-600 font-medium mb-1">{variant.label}</p>
                  )}
                  <p className="text-brand-600 font-bold">{formatNGN(price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, variant?.id, quantity - 1)}
                        className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 text-sm"
                      >−</button>
                      <span className="px-3 py-1.5 text-sm font-semibold border-x border-gray-200">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, variant?.id, quantity + 1)}
                        className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 text-sm"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeItem(product.id, variant?.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">{formatNGN(price * quantity)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span className="font-medium text-gray-900">{formatNGN(sub)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service fee (5%)</span><span className="font-medium text-gray-900">{formatNGN(serviceFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery fee</span><span className="text-xs text-gray-400 self-center">Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total <span className="text-xs font-normal text-gray-400">(excl. delivery)</span></span>
                <span className="text-lg">{formatNGN(total)}</span>
              </div>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full text-base py-3">
              <ShoppingBag className="h-5 w-5" />
              Proceed to checkout
            </button>
            <Link to="/products" className="block text-center mt-3 text-sm text-gray-500 hover:text-gray-700">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
