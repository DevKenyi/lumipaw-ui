import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-bold">Lumi<span className="text-brand-600">Paws</span></span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Premium pet food & supplies delivered fast across Nigeria. Your pet deserves the best.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/products" className="hover:text-gray-900 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=DOG_FOOD" className="hover:text-gray-900 transition-colors">Dog Food</Link></li>
              <li><Link to="/products?category=CAT_FOOD" className="hover:text-gray-900 transition-colors">Cat Food</Link></li>
              <li><Link to="/products?category=ACCESSORIES" className="hover:text-gray-900 transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="mailto:hello@lumipaws.com" className="hover:text-gray-900 transition-colors">hello@lumipaws.com</a></li>
              <li><Link to="/orders" className="hover:text-gray-900 transition-colors">Track Order</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-8 pt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} LumiPaws by Lumitech Systems. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
