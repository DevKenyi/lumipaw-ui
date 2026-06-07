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
            <span className="badge bg-gray-200 text-gray-600 text-xs">Out of stock</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="badge bg-brand-100 text-brand-700 text-xs px-1.5 py-0.5">
            {product.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 mb-1.5">
          {product.name}
        </h3>

        <div className="flex items-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${i < Math.round(product.averageRating ?? 0) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
            />
          ))}
          {product.reviewCount > 0 && (
            <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
          )}
        </div>

        {hasVariants && (
          <p className="text-xs text-gray-400 mb-1">{product.variants.length} sizes</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-1">
          <div>
            {hasVariants && <p className="text-xs text-gray-400 leading-none mb-0.5">From</p>}
            <span className="text-sm sm:text-base font-bold text-gray-900">{formatNGN(minPrice)}</span>
          </div>
          {hasVariants ? (
            <span className="flex items-center gap-0.5 text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1.5 rounded-lg">
              Pick <ChevronRight className="h-3 w-3" />
            </span>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="p-1.5 sm:p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
