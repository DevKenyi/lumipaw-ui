import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { productsApi } from '../api/products';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: '🦴 Dog Food', value: 'DOG_FOOD' },
  { label: '🐱 Cat Food', value: 'CAT_FOOD' },
  { label: '🎁 Dog Treats', value: 'DOG_TREATS' },
  { label: '🎀 Accessories', value: 'ACCESSORIES' },
  { label: '🧶 Cat Accessories', value: 'CAT_ACCESSORIES' },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const category = params.get('category') ?? '';
  const page = parseInt(params.get('page') ?? '0');

  const { data, isLoading } = useQuery({
    queryKey: ['products', category, search, page],
    queryFn: () => productsApi.list({ category: category || undefined, search: search || undefined, page, size: 24 }),
    placeholderData: (prev) => prev,
  });

  const products = data?.data.data.content ?? [];
  const totalPages = data?.data.data.totalPages ?? 1;

  const updateCategory = (cat: string) => {
    const next = new URLSearchParams(params);
    if (cat) next.set('category', cat); else next.delete('category');
    next.delete('page');
    setParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (search) next.set('search', search); else next.delete('search');
    next.delete('page');
    setParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
      <p className="text-gray-500 mb-8">Premium pet supplies delivered to your door</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input pl-10"
          />
        </form>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => updateCategory(c.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                category === c.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : products.length === 0 ? (
        <EmptyState title="No products found" description="Try a different search or category" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { const n = new URLSearchParams(params); n.set('page', String(i)); setParams(n); }}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                    i === page ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
