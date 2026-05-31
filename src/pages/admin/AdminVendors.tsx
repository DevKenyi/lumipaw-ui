import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminVendorApi } from '../../api/vendorApi';
import AdminLayout from '../../components/layout/AdminLayout';
import { formatDate } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';

export default function AdminVendors() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: () => adminVendorApi.list({ size: 50 }),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminVendorApi.activate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-vendors'] }); toast.success('Vendor activated'); },
    onError: () => toast.error('Failed to activate vendor'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminVendorApi.deactivate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-vendors'] }); toast.success('Vendor deactivated'); },
    onError: () => toast.error('Failed to deactivate vendor'),
  });

  const vendors = data?.data.data.content ?? [];
  const pending = vendors.filter((v) => !v.active).length;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <p className="text-gray-500 mt-1">
          {vendors.length} registered · {pending > 0 && <span className="text-amber-600 font-semibold">{pending} pending activation</span>}
        </p>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Business', 'Email', 'Phone', 'Status', 'Applied', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{v.businessName}</p>
                    {v.description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{v.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v.email}</td>
                  <td className="px-4 py-3 text-gray-500">{v.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${v.active ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {v.active ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(v.createdAt)}</td>
                  <td className="px-4 py-3">
                    {v.active ? (
                      <button onClick={() => deactivateMutation.mutate(v.id)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
                        <XCircle className="h-4 w-4" /> Deactivate
                      </button>
                    ) : (
                      <button onClick={() => activateMutation.mutate(v.id)}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium">
                        <CheckCircle className="h-4 w-4" /> Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
