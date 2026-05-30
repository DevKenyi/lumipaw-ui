import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../api/axios';
import type { ApiResponse, PageResponse, Invoice } from '../../types';
import AdminLayout from '../../components/layout/AdminLayout';
import { formatNGN, formatDateTime } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function AdminInvoices() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-invoices', page],
    queryFn: () => api.get<ApiResponse<PageResponse<Invoice>>>('/api/admin/invoices', { params: { page, size: 20 } }),
  });

  const invoices = data?.data.data.content ?? [];
  const totalPages = data?.data.data.totalPages ?? 1;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-500 mt-1">{data?.data.data.totalElements ?? 0} invoices generated</p>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Invoice #', 'Customer', 'Amount', 'Status', 'Generated'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-900">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{inv.customerName}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{formatNGN(inv.amount)}</td>
                  <td className="px-4 py-3"><Badge label={inv.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(inv.generatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${i === page ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
