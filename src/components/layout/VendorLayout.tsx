import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const nav = [
  { to: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vendor/products', label: 'My Products', icon: Package },
  { to: '/vendor/submit', label: 'Submit Product', icon: PlusCircle },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col">
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
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
