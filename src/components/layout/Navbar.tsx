import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export default function Navbar() {
  const { isAuthenticated, isAdmin, isVendor, user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold text-gray-900">
              Lumi<span className="text-brand-600">Paws</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Shop
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                My Orders
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-1">
                {isAdmin && (
                  <Link to="/admin/dashboard" className="btn-ghost text-brand-700">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                {isVendor && (
                  <Link to="/vendor/dashboard" className="btn-ghost text-brand-700">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{user?.firstName}</span>
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-red-500">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost">Sign in</Link>
                <Link to="/register" className="btn-primary">Get started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          <Link to="/products" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Shop</Link>
          {isAuthenticated && (
            <Link to="/orders" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700">My Orders</Link>
          )}
          {isAuthenticated && (
            <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700">My Profile</Link>
          )}
          {isAdmin && (
            <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-brand-700">Admin Dashboard</Link>
          )}
          {isVendor && (
            <Link to="/vendor/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-brand-700">Vendor Dashboard</Link>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="block w-full text-left py-2 text-sm font-medium text-red-500">Sign out</button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 justify-center">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 justify-center">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
