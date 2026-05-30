import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, ShieldCheck, HeartHandshake } from 'lucide-react';
import { productsApi } from '../api/products';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';

const categories = [
  { label: 'Dog Food', value: 'DOG_FOOD', emoji: '🦴' },
  { label: 'Cat Food', value: 'CAT_FOOD', emoji: '🐟' },
  { label: 'Dog Treats', value: 'DOG_TREATS', emoji: '🎁' },
  { label: 'Accessories', value: 'ACCESSORIES', emoji: '🎀' },
  { label: 'Cat Accessories', value: 'CAT_ACCESSORIES', emoji: '🧶' },
];

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.list({ size: 8 }),
  });

  const products = data?.data.data.content ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🐶</div>
          <div className="absolute bottom-10 right-10 text-9xl">🐱</div>
          <div className="absolute top-1/2 right-1/4 text-7xl">🐾</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="max-w-2xl">
            <span className="badge bg-white/20 text-white mb-4">🇳🇬 Delivering across Nigeria</span>
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
              Your pets deserve<br />
              <span className="text-brand-300">the very best</span>
            </h1>
            <p className="text-xl text-brand-100 mb-8 leading-relaxed">
              Premium pet food, treats & supplies — delivered fast to your door. Trusted by 1,000+ pet owners in Nigeria.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-brand-700 font-bold hover:bg-brand-50 transition-colors">
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-colors">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Truck, label: 'Fast Delivery', desc: 'Same-day delivery in Lagos' },
              { icon: ShieldCheck, label: 'Quality Guaranteed', desc: '100% authentic products' },
              { icon: HeartHandshake, label: 'Trusted by Vets', desc: 'Vet-recommended brands' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-brand-50">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by category</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/products?category=${cat.value}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl bg-white border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors shadow-card"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured products</h2>
          <Link to="/products" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
