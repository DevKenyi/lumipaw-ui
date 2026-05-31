import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';

// Admin
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminVendors from './pages/admin/AdminVendors';

// Vendor
import RegisterVendor from './pages/RegisterVendor';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorSubmitProduct from './pages/vendor/VendorSubmitProduct';
import VendorBulkUpload from './pages/vendor/VendorBulkUpload';
import VendorEarnings from './pages/vendor/VendorEarnings';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminDeliveryZones from './pages/admin/AdminDeliveryZones';

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}

function RequireAuth({ admin = false, vendor = false }: { admin?: boolean; vendor?: boolean }) {
  const { isAuthenticated, isAdmin, isVendor } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  if (vendor && !isVendor) return <Navigate to="/" replace />;
  return <Outlet />;
}

function GuestOnly() {
  const { isAuthenticated, isAdmin, isVendor } = useAuthStore();
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin/dashboard' : isVendor ? '/vendor/dashboard' : '/products'} replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontSize: '14px' } }} />
        <Routes>
          {/* Guest only */}
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-vendor" element={<RegisterVendor />} />
          </Route>

          {/* Public + customer routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

            <Route element={<RequireAuth />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
            </Route>
          </Route>

          {/* Vendor routes */}
          <Route element={<RequireAuth vendor />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/products" element={<VendorProducts />} />
            <Route path="/vendor/submit" element={<VendorSubmitProduct />} />
            <Route path="/vendor/bulk-upload" element={<VendorBulkUpload />} />
            <Route path="/vendor/earnings" element={<VendorEarnings />} />
          </Route>

          {/* Admin routes */}
          <Route element={<RequireAuth admin />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/vendors" element={<AdminVendors />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/invoices" element={<AdminInvoices />} />
            <Route path="/admin/payouts" element={<AdminPayouts />} />
            <Route path="/admin/delivery-zones" element={<AdminDeliveryZones />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
