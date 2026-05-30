import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ArrowLeft, Star, Package } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { productsApi } from '../api/products';
import { useCartStore } from '../store/cartStore';
import { formatNGN } from '../utils/format';
import Spinner from '../components/ui/Spinner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  });

  const product = data?.data.data;

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!product) return <div className="text-center py-24 text-gray-500">Product not found</div>;

  const handleAdd = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div>
          <span className="badge bg-brand-100 text-brand-700 mb-3">{product.category.replace('_', ' ')}</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
            <span className="text-sm text-gray-400">(12 reviews)</span>
          </div>

          <p className="text-4xl font-bold text-gray-900 mb-6">{formatNGN(product.price)}</p>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-2 mb-6">
            <Package className="h-4 w-4 text-gray-400" />
            <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
              {product.inStock ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {product.inStock && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium">−</button>
                <span className="px-5 py-3 font-semibold text-gray-900 border-x border-gray-200">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium">+</button>
              </div>
              <button onClick={handleAdd} className="btn-primary flex-1 text-base py-3">
                <ShoppingCart className="h-5 w-5" />
                Add to cart
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100">
            {[
              ['🚚', 'Fast Delivery', 'Lagos same-day'],
              ['🔒', 'Secure Payment', 'Paystack protected'],
              ['✅', 'Authentic', 'Quality guaranteed'],
              ['📦', 'Easy Returns', '7-day policy'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
