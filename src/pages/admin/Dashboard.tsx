import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import { customersApi } from '../../api/customers';
import { ordersApi } from '../../api/orders';
import AdminLayout from '../../components/layout/AdminLayout';
import { formatNGN, formatDateTime } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => customersApi.dashboard(),
    refetchInterval: 30_000,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders-recent'],
    queryFn: () => ordersApi.adminList({ size: 5 }),
  });

  const s = stats?.data.data;
  const recentOrders = ordersData?.data.data.content ?? [];

  const cards = s ? [
    { label: 'Total Revenue', value: formatNGN(s.totalRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600', change: '+12% this month' },
    { label: 'Total Orders', value: s.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', change: `${s.ordersThisMonth} this month` },
    { label: 'Customers', value: s.totalCustomers.toLocaleString(), icon: Users, color: 'bg-purple-50 text-purple-600', change: 'Registered' },
    { label: 'Products', value: s.totalProducts.toLocaleString(), icon: Package, color: 'bg-amber-50 text-amber-600', change: 'Listed' },
  ] : [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">LumiPaws business overview</p>
      </div>

      {statsLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {cards.map(({ label, value, icon: Icon, color, change }) => (
              <div key={label} className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
                <p className="text-xs text-green-600 font-medium mt-0.5">{change}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Recent Orders</h2>
              <a href="/admin/orders" className="text-sm text-brand-600 font-medium hover:underline">View all</a>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">#{order.id.substring(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{order.customerName} · {formatDateTime(order.createdAt)}</p>
                  </div>
                  <Badge label={order.orderStatus} />
                  <Badge label={order.paymentStatus} />
                  <p className="font-bold text-gray-900 text-sm">{formatNGN(order.totalAmount)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
