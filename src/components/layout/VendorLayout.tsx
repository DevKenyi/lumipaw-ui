import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, Upload, LogOut, ChevronRight, Menu, X, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const nav = [
  { to: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vendor/products', label: 'My Products', icon: Package },
  { to: '/vendor/submit', label: 'Submit', icon: PlusCircle },
  { to: '/vendor/bulk-upload', label: 'Bulk Upload', icon: Upload },
  { to: '/vendor/earnings', label: 'Earnings', icon: TrendingUp },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { logout, user } = useAuthStore();
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
          <span className="badge bg-amber-100 text-amber-700 ml-auto">Vendor</span>
        </Link>

        <div className="px-6 py-3 border-b border-gray-50">
          <p className="text-xs text-gray-400">Signed in as</p>
          <p className="text-sm font-semibold text-gray-800 truncate">{user?.firstName}</p>
        </div>

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
          <span className="badge bg-amber-100 text-amber-700 text-xs ml-1">Vendor</span>
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
              <div>
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm font-semibold text-gray-800">{user?.firstName}</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
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
      <main className="flex-1 overflow-auto pt-14 md:pt-0 pb-20 md:pb-0 p-4 md:p-8">
        {children}
      </main>

      {/* ── Mobile bottom nav ────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 flex">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium transition-colors ${
              pathname === to ? 'text-brand-600' : 'text-gray-400'
            }`}
          >
            <Icon className={`h-5 w-5 ${pathname === to ? 'text-brand-600' : 'text-gray-400'}`} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
