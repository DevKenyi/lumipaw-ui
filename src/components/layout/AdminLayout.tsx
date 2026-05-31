import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, FileText, Store, LogOut, ChevronRight, Wallet, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/vendors', label: 'Vendors', icon: Store },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/invoices', label: 'Invoices', icon: FileText },
  { to: '/admin/payouts', label: 'Payouts', icon: Wallet },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex w-60 shrink-0 bg-white border-r border-gray-100 flex-col">
        <Link to="/" className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <span className="text-xl">🐾</span>
          <span className="font-bold text-gray-900">Lumi<span className="text-brand-600">Paws</span></span>
          <span className="badge bg-brand-100 text-brand-700 ml-auto">Admin</span>
        </Link>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === to ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {pathname === to && <ChevronRight className="h-3 w-3 ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ───────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-1.5">
          <span className="text-lg">🐾</span>
          <span className="font-bold text-gray-900 text-sm">Lumi<span className="text-brand-600">Paws</span></span>
          <span className="badge bg-brand-100 text-brand-700 text-xs ml-1">Admin</span>
        </Link>
        <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* ── Mobile drawer ────────────────────────────────── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto w-64 bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-bold text-gray-900">Admin Menu</span>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {nav.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === to ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-100">
              <button onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────── */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
