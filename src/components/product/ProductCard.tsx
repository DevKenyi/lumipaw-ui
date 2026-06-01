import { ShoppingCart, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { formatNGN } from '../../utils/format';
import ProductImage from '../ui/ProductImage';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const hasVariants = product.variants && product.variants.length > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock || hasVariants) return;
    addItem(product, null);
    toast.success(`${product.name} added to cart`);
  };

  const minPrice = hasVariants
    ? Math.min(...product.variants.map((v) => v.price))
    : product.price;

  return (
    <Link to={`/products/${product.id}`} className="group card overflow-hidden flex flex-col hover:shadow-card-hover transition-shadow duration-200">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!product.inStock && !hasVariants && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="badge bg-gray-200 text-gray-600">Out of stock</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="badge bg-brand-100 text-brand-700">{product.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">{product.name}</h3>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.round(product.averageRating ?? 0) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">
            {product.reviewCount > 0 ? `(${product.reviewCount})` : 'No reviews'}
          </span>
        </div>

        {hasVariants && (
          <p className="text-xs text-gray-500 mb-2">{product.variants.length} size options</p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div>
            {hasVariants && <p className="text-xs text-gray-400">From</p>}
            <span className="text-lg font-bold text-gray-900">{formatNGN(minPrice)}</span>
          </div>
          {hasVariants ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-2 rounded-xl">
              Choose <ChevronRight className="h-3 w-3" />
            </span>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
