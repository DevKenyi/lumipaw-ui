import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ArrowLeft, Star, Package, MessageCircle } from 'lucide-react';

// Replace with your actual WhatsApp business number (digits only, no + or spaces)
const WHATSAPP_NUMBER = '2348000000000';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { productsApi } from '../api/products';
import { reviewsApi } from '../api/reviewsApi';
import { useCartStore } from '../store/cartStore';
import { formatNGN, formatDateTime } from '../utils/format';
import Spinner from '../components/ui/Spinner';
import ProductImage from '../components/ui/ProductImage';
import type { ProductVariant } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  });

  const product = data?.data.data;

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!product) return <div className="text-center py-24 text-gray-500">Product not found</div>;

  const hasVariants = product.variants && product.variants.length > 0;
  const activeVariants = hasVariants ? product.variants.filter((v) => v.active) : [];
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isInStock = selectedVariant ? selectedVariant.inStock : product.inStock;
  const canAdd = isInStock && (!hasVariants || selectedVariant !== null);

  const handleAdd = () => {
    if (!canAdd) return;
    addItem(product, hasVariants ? selectedVariant : null, qty);
    toast.success(`${product.name}${selectedVariant ? ` (${selectedVariant.label})` : ''} added to cart`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div>
          <span className="badge bg-brand-100 text-brand-700 mb-3">{product.category.replace('_', ' ')}</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(product.averageRating ?? 0) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
            <span className="text-sm text-gray-500">
              {product.reviewCount > 0
                ? <>{product.averageRating.toFixed(1)} <span className="text-gray-400">({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})</span></>
                : <span className="text-gray-400">No reviews yet</span>}
            </span>
          </div>

          <p className="text-4xl font-bold text-gray-900 mb-2">
            {hasVariants && !selectedVariant && <span className="text-2xl text-gray-400 mr-1">From</span>}
            {formatNGN(hasVariants && !selectedVariant ? Math.min(...activeVariants.map((v) => v.price)) : displayPrice)}
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Variant picker */}
          {hasVariants && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Select size / option {selectedVariant === null && <span className="text-red-400 font-normal">(required)</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {activeVariants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVariant(v); setQty(1); }}
                    disabled={!v.inStock}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      selectedVariant?.id === v.id
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : v.inStock
                        ? 'border-gray-200 bg-white text-gray-800 hover:border-brand-300'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                    }`}
                  >
                    {v.label}
                    <span className={`ml-1.5 text-xs ${selectedVariant?.id === v.id ? 'text-brand-100' : 'text-gray-400'}`}>
                      {formatNGN(v.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-6">
            <Package className="h-4 w-4 text-gray-400" />
            <span className={`text-sm font-medium ${isInStock ? 'text-orange-600' : 'text-red-500'}`}>
              {hasVariants && !selectedVariant
                ? 'Select an option to see stock'
                : isInStock
                ? `🔥 Only ${displayStock} left in stock`
                : 'Out of stock'}
            </span>
          </div>

          {(isInStock || (hasVariants && !selectedVariant)) && (
            <div className="flex items-center gap-4 mb-6">
              {(selectedVariant || !hasVariants) && isInStock && (
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium">−</button>
                  <span className="px-5 py-3 font-semibold text-gray-900 border-x border-gray-200">{qty}</span>
                  <button onClick={() => setQty(Math.min(displayStock, qty + 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium">+</button>
                </div>
              )}
              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className="btn-primary flex-1 text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                {hasVariants && !selectedVariant ? 'Select an option' : 'Add to cart'}
              </button>
            </div>
          )}

          {/* WhatsApp ordering */}
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100">
            <p className="text-sm font-semibold text-green-800 mb-2.5">Need help or want to order via WhatsApp?</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm interested in buying *${product.name}*${selectedVariant ? ` (${selectedVariant.label})` : ''}. Can you help me place an order?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100">
            {[
              ['🚚', 'Fast Delivery', 'Same day in Abuja & Lagos'],
              ['🔒', 'Secure Payment', 'Flutterwave protected'],
              ['✅', 'Genuine Product', '100% authentic'],
              ['🗺️', 'Nationwide', 'Delivered to all 36 states'],
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

      <ReviewsSection productId={id!} />
    </div>
  );
}

function ReviewsSection({ productId }: { productId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.getByProduct(productId, { size: 10 }),
  });

  const reviews = data?.data.data.content ?? [];

  return (
    <div className="mt-12 border-t border-gray-100 pt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Customer Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal text-base">({reviews.length})</span>}
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Star className="h-8 w-8 mx-auto mb-2 text-gray-200" />
          <p>No reviews yet. Purchase this product to leave the first review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{r.customerName}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{formatDateTime(r.createdAt)}</span>
              </div>
              {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
