import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Search, MapPin, Star } from 'lucide-react';
import { productsApi } from '../api/products';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';

const categories = [
  { label: 'Dog Food', value: 'DOG_FOOD', emoji: '🦴' },
  { label: 'Cat Food', value: 'CAT_FOOD', emoji: '🐱' },
  { label: 'Dog Treats', value: 'DOG_TREATS', emoji: '🎁' },
  { label: 'Accessories', value: 'ACCESSORIES', emoji: '🎀' },
  { label: 'Cat Accessories', value: 'CAT_ACCESSORIES', emoji: '🧶' },
];

const DELIVERY_ESTIMATES = [
  { city: 'Abuja', time: '1–2 days', color: 'text-blue-600 bg-blue-50' },
  { city: 'Lagos', time: 'Same day', color: 'text-green-600 bg-green-50' },
  { city: 'Other states', time: '2–5 days', color: 'text-amber-600 bg-amber-50' },
];

const TRUST_BADGES = [
  { icon: '🚚', label: 'Nationwide Delivery', desc: 'All 36 states' },
  { icon: '✅', label: 'Genuine Products', desc: '100% authentic' },
  { icon: '💳', label: 'Pay on Delivery', desc: 'No upfront risk' },
  { icon: '⚡', label: 'Fast Dispatch', desc: 'Order before 12pm' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.list({ size: 8 }),
  });

  const products = data?.data.data.content ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    else navigate('/products');
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white overflow-hidden">
        {/* Background emojis — desktop only */}
        <div className="hidden sm:block absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 text-9xl">🐶</div>
          <div className="absolute bottom-10 right-10 text-9xl">🐱</div>
          <div className="absolute top-1/2 right-1/4 text-7xl">🐾</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-20 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full mb-3">
              🇳🇬 Delivering across Nigeria
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-3 sm:mb-4">
              Premium Pet Food<br />
              <span className="text-brand-300">Delivered to Your Door</span>
            </h1>
            <p className="text-sm sm:text-xl text-brand-100 mb-5 sm:mb-8 leading-relaxed max-w-lg">
              Trusted food, treats and accessories for dogs and cats — delivered anywhere in Nigeria.
            </p>

            <div className="flex gap-3 mb-6 sm:mb-10">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-white text-brand-700 font-bold hover:bg-brand-50 transition-colors text-sm sm:text-base"
              >
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-colors text-sm sm:text-base"
              >
                Sign up
              </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pet food, treats…"
                  className="w-full pl-9 sm:pl-11 pr-3 py-3 sm:py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-brand-400 hover:bg-brand-300 text-white font-semibold text-sm transition-colors shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {TRUST_BADGES.map(({ icon, label, desc }) => (
              <div key={label} className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl shrink-0">{icon}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">{label}</p>
                  <p className="text-xs text-gray-400 hidden sm:block">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery estimates */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
              <MapPin className="h-3.5 w-3.5 text-brand-600" />
              Delivery:
            </div>
            {DELIVERY_ESTIMATES.map(({ city, time, color }) => (
              <span key={city} className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${color}`}>
                {city}: {time}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4">Shop by category</h2>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/products?category=${cat.value}`}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl bg-white border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors shadow-card"
            >
              <span className="text-2xl sm:text-3xl">{cat.emoji}</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Featured products</h2>
          <Link to="/products" className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Social proof strip */}
      <section className="bg-brand-900 text-white py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-base sm:text-xl font-bold mb-1">Trusted by pet owners across Nigeria</p>
          <p className="text-brand-300 text-xs sm:text-sm">Genuine products · Fast delivery · Friendly support</p>
        </div>
      </section>
    </div>
  );
}
