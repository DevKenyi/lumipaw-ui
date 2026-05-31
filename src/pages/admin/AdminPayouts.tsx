import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, TrendingUp, Clock, CheckCircle, Edit2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import { adminPayoutsApi } from '../../api/payoutApi';
import type { VendorPayoutRecord } from '../../api/payoutApi';
import { formatNGN } from '../../utils/format';

type StatusFilter = 'ALL' | 'PENDING' | 'PAID';

function StatusBadge({ status }: { status: VendorPayoutRecord['status'] }) {
  if (status === 'PAID') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3" />
        Paid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
}

export default function AdminPayouts() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [editingFee, setEditingFee] = useState(false);
  const [feeInput, setFeeInput] = useState('');

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['admin-payouts-summary'],
    queryFn: () => adminPayoutsApi.summary().then(r => r.data.data),
  });

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['admin-payouts-list', filter],
    queryFn: () =>
      adminPayoutsApi
        .list({ status: filter === 'ALL' ? undefined : filter, page: 0, size: 50 })
        .then(r => r.data.data),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => adminPayoutsApi.markPaid(id).then(r => r.data.data),
    onSuccess: () => {
      toast.success('Payout marked as paid');
      qc.invalidateQueries({ queryKey: ['admin-payouts-list'] });
      qc.invalidateQueries({ queryKey: ['admin-payouts-summary'] });
    },
    onError: () => toast.error('Failed to update payout'),
  });

  const updateFeeMutation = useMutation({
    mutationFn: (feePct: number) => adminPayoutsApi.updateFeePct(feePct).then(r => r.data.data),
    onSuccess: () => {
      toast.success('Platform fee updated');
      qc.invalidateQueries({ queryKey: ['admin-payouts-summary'] });
      setEditingFee(false);
    },
    onError: () => toast.error('Failed to update fee'),
  });

  const summary = summaryData;
  const records = listData?.content ?? [];

  const handleSaveFee = () => {
    const val = parseFloat(feeInput);
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error('Please enter a valid percentage between 0 and 100');
      return;
    }
    updateFeeMutation.mutate(val);
  };

  const handleEditFee = () => {
    setFeeInput(summary?.currentFeePct?.toString() ?? '5');
    setEditingFee(true);
  };

  const tabs: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Paid', value: 'PAID' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage vendor payouts and platform fee settings</p>
        </div>

        {/* Platform Fee Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-brand-600" />
              <span className="text-sm font-semibold text-gray-700">Platform Fee</span>
            </div>
            {!editingFee && (
              <button
                onClick={handleEditFee}
                className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
          </div>

          {editingFee ? (
            <div className="flex items-center gap-2 mt-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={feeInput}
                  onChange={e => setFeeInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 pr-7"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
              </div>
              <button
                onClick={handleSaveFee}
                disabled={updateFeeMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={() => setEditingFee(false)}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {summary?.currentFeePct ?? '—'}<span className="text-lg font-medium text-gray-400">%</span>
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">Deducted from vendor payout on product price</p>
        </div>

        {/* Summary Cards */}
        {summaryLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-brand-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Platform Revenue</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNGN(summary.totalPlatformRevenue)}</p>
              <p className="text-xs text-gray-400 mt-1">Collected from paid orders</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Pending Payouts</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNGN(summary.pendingPayouts)}</p>
              <p className="text-xs text-gray-400 mt-1">Vendor net due</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Paid Out</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNGN(summary.paidPayouts)}</p>
              <p className="text-xs text-gray-400 mt-1">Total transferred to vendors</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Current Fee</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {summary.currentFeePct}<span className="text-base font-medium text-gray-400">%</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Active platform fee</p>
            </div>
          </div>
        ) : null}

        {/* Payouts Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.value
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {listLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No payout records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Vendor</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3 text-right">Gross</th>
                    <th className="px-6 py-3 text-right">Fee</th>
                    <th className="px-6 py-3 text-right">Net</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(record.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-700 max-w-[140px] truncate">
                        {record.vendorBusinessName ?? '—'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-[180px] truncate">
                        {record.productName}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700">
                        {formatNGN(record.grossAmount)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {formatNGN(record.platformFee)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatNGN(record.netAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-6 py-4">
                        {record.status === 'PENDING' && (
                          <button
                            onClick={() => markPaidMutation.mutate(record.id)}
                            disabled={markPaidMutation.isPending}
                            className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                          >
                            Mark as Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
