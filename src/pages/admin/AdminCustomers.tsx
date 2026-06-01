import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, X, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { customersApi } from '../../api/customers';
import AdminLayout from '../../components/layout/AdminLayout';
import { formatDate } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import type { Customer } from '../../types';

interface PromoteModalProps {
  customer: Customer;
  onClose: () => void;
}

function PromoteModal({ customer, onClose }: PromoteModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ businessName: '', description: '', phone: customer.phone ?? '' });

  const mutation = useMutation({
    mutationFn: () => customersApi.promoteToVendor(customer.id, {
      businessName: form.businessName,
      description: form.description || undefined,
      phone: form.phone || undefined,
    }),
    onSuccess: () => {
      toast.success(`${customer.fullName} is now a vendor`);
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to promote customer');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Promote to Vendor</h2>
            <p className="text-sm text-gray-500 mt-0.5">{customer.fullName} · {customer.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business name <span className="text-red-400">*</span></label>
            <input
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              className="input"
              placeholder="e.g. Pawsome Pet Store"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input resize-none"
              rows={3}
              placeholder="Tell customers about this vendor…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="input"
              placeholder="08012345678"
            />
          </div>
          <p className="text-xs text-gray-400">The vendor account will be activated immediately and the user can log in and start listing products.</p>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            disabled={!form.businessName.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {mutation.isPending ? 'Promoting…' : 'Promote to Vendor'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [promoting, setPromoting] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search, page],
    queryFn: () => customersApi.list({ search: search || undefined, page, size: 20 }),
    placeholderData: (prev) => prev,
  });

  const customers = data?.data.data.content ?? [];
  const totalPages = data?.data.data.totalPages ?? 1;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">{data?.data.data.totalElements ?? 0} registered customers</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search customers…" className="input pl-9 w-full sm:w-64" />
        </div>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Email', 'Phone', 'City', 'State', 'Joined', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                        {c.firstName[0]}
                      </div>
                      <span className="font-medium text-gray-900">{c.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-500">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.city || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.state || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setPromoting(c)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors"
                    >
                      <Store size={13} />
                      Make Vendor
                    </button>
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
              className={`w-9 h-9 rounded-lg text-sm font-medium ${i === page ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {promoting && <PromoteModal customer={promoting} onClose={() => setPromoting(null)} />}
    </AdminLayout>
  );
}
