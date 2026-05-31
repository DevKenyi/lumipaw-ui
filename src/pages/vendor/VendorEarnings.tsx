import { useQuery } from '@tanstack/react-query';
import { DollarSign, Clock, CheckCircle, TrendingDown } from 'lucide-react';
import VendorLayout from '../../components/layout/VendorLayout';
import Spinner from '../../components/ui/Spinner';
import { vendorEarningsApi } from '../../api/payoutApi';
import type { VendorPayoutRecord } from '../../api/payoutApi';
import { formatNGN } from '../../utils/format';

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

export default function VendorEarnings() {
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['vendor-earnings-summary'],
    queryFn: () => vendorEarningsApi.summary().then(r => r.data.data),
  });

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['vendor-earnings-list'],
    queryFn: () => vendorEarningsApi.list({ page: 0, size: 50 }).then(r => r.data.data),
  });

  const summary = summaryData;
  const records = listData?.content ?? [];

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-sm text-gray-500 mt-1">Your payout history and earnings summary</p>
        </div>

        {/* Summary Cards */}
        {summaryLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Pending Payout</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNGN(summary.pendingNet)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.pendingCount} order{summary.pendingCount !== 1 ? 's' : ''}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Total Paid Out</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNGN(summary.paidNet)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.paidCount} order{summary.paidCount !== 1 ? 's' : ''}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-brand-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Lifetime Gross</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNGN(summary.totalGross)}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <span className="text-sm font-medium text-gray-500">Lifetime Fees</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNGN(summary.totalFees)}</p>
            </div>
          </div>
        ) : null}

        {/* Payout Records Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Payout History</h2>
          </div>

          {listLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No payout records yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3 text-right">Gross</th>
                    <th className="px-6 py-3 text-right">Fee (%)</th>
                    <th className="px-6 py-3 text-right">Net</th>
                    <th className="px-6 py-3">Status</th>
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
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                        {record.productName}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700">
                        {formatNGN(record.grossAmount)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {formatNGN(record.platformFee)}
                        <span className="text-xs text-gray-400 ml-1">({record.platformFeePct}%)</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatNGN(record.netAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={record.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
