import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersApi } from '../../api/orders';
import AdminLayout from '../../components/layout/AdminLayout';
import { formatNGN, formatDateTime } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import type { OrderStatus } from '../../types';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => ordersApi.adminList({ page, size: 20 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Status updated'); },
    onError: () => toast.error('Failed to update status'),
  });

  const orders = data?.data.data.content ?? [];
  const totalPages = data?.data.data.totalPages ?? 1;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">{data?.data.data.totalElements ?? 0} total orders</p>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{o.id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{o.customerName}</p>
                    <p className="text-xs text-gray-400">{o.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.items.length} item(s)</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{formatNGN(o.totalAmount)}</td>
                  <td className="px-4 py-3"><Badge label={o.paymentStatus} /></td>
                  <td className="px-4 py-3"><Badge label={o.orderStatus} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => updateMutation.mutate({ id: o.id, status: e.target.value })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-brand-400"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${i === page ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
