import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { formatNGN, formatDateTime } from '../utils/format';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.myOrders({ size: 20 }),
  });

  const orders = data?.data.data.content ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Once you place an order, it'll show up here"
          action={<Link to="/products" className="btn-primary">Start shopping</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">Order #{order.id.substring(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Badge label={order.paymentStatus} />
                  <Badge label={order.orderStatus} />
                </div>
              </div>

              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {order.items.slice(0, 3).map((item) => (
                  <img key={item.id} src={item.productImageUrl} alt={item.productName}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0" />
                ))}
                {order.items.length > 3 && (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-gray-500">+{order.items.length - 3}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{formatNGN(order.totalAmount)}</span>
                <Link to={`/orders/${order.id}`} className="btn-secondary text-sm py-1.5 px-4">
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
