import { useQuery } from '@tanstack/react-query';
import { Package, Clock, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { vendorApi } from '../../api/vendorApi';
import VendorLayout from '../../components/layout/VendorLayout';
import Spinner from '../../components/ui/Spinner';
import { formatNGN } from '../../utils/format';
import ProductImage from '../../components/ui/ProductImage';

export default function VendorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: () => vendorApi.myProducts({ size: 100 }),
  });

  const products = data?.data.data.content ?? [];
  const approved = products.filter((p) => p.approvalStatus === 'APPROVED').length;
  const pending = products.filter((p) => p.approvalStatus === 'PENDING_REVIEW').length;
  const rejected = products.filter((p) => p.approvalStatus === 'REJECTED').length;

  return (
    <VendorLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your product listings</p>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
              { label: 'Approved', value: approved, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
              { label: 'Pending Review', value: pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
              { label: 'Rejected', value: rejected, icon: XCircle, color: 'bg-red-50 text-red-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-5">
                <div className={`p-2.5 rounded-xl ${color} w-fit mb-3`}><Icon className="h-5 w-5" /></div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {rejected > 0 && (
            <div className="card p-5 border-l-4 border-red-400 mb-6">
              <p className="font-semibold text-red-700">You have {rejected} rejected product{rejected > 1 ? 's' : ''}</p>
              <p className="text-sm text-gray-500 mt-1">Review the rejection reasons and resubmit with corrections.</p>
              <Link to="/vendor/products" className="text-sm text-brand-600 font-medium mt-2 inline-block hover:underline">
                View rejected products →
              </Link>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Recent products</h2>
              <Link to="/vendor/submit" className="btn-primary text-sm py-2">
                <PlusCircle className="h-4 w-4" /> New product
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {products.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-4">
                  <ProductImage src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={p.approvalStatus} />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 shrink-0">{formatNGN(p.price)}</p>
                </div>
              ))}
              {products.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <p>No products yet.</p>
                  <Link to="/vendor/submit" className="text-brand-600 font-medium hover:underline mt-1 inline-block">Submit your first product</Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </VendorLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    PENDING_REVIEW: 'bg-amber-100 text-amber-700',
    REJECTED: 'bg-red-100 text-red-600',
  };
  return <span className={`badge ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{status.replace('_', ' ')}</span>;
}
