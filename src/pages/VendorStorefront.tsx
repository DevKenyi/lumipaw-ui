import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Store, Phone, Mail, Package } from 'lucide-react';
import { publicVendorsApi } from '../api/vendorApi';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';

export default function VendorStorefront() {
  const { id } = useParams<{ id: string }>();

  const { data: vendorData, isLoading: vendorLoading, isError } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => publicVendorsApi.getById(id!),
    enabled: !!id,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['vendor-products', id],
    queryFn: () => publicVendorsApi.getProducts(id!, { size: 24 }),
    enabled: !!id,
  });

  const vendor = vendorData?.data.data;
  const products = productsData?.data.data.content ?? [];

  if (vendorLoading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  if (isError || !vendor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 mb-4">Shop not found.</p>
        <Link to="/products" className="btn-primary">Browse all products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ChevronLeft size={16} />
        Back to products
      </Link>

      {/* Vendor header */}
      <div className="card p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center shrink-0">
            <Store className="h-7 w-7 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{vendor.businessName}</h1>
            {vendor.description && (
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">{vendor.description}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
              {vendor.email && (
                <span className="flex items-center gap-1">
                  <Mail size={12} />
                  {vendor.email}
                </span>
              )}
              {vendor.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={12} />
                  {vendor.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Package size={12} />
                {products.length} product{products.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Products</h2>
      {productsLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No products available yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
