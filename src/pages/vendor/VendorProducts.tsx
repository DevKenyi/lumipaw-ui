import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorApi } from '../../api/vendorApi';
import VendorLayout from '../../components/layout/VendorLayout';
import { formatNGN } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import type { Product, ProductVariantInput } from '../../types';
import { X, Plus } from 'lucide-react';

const EMPTY_FORM = { name: '', description: '', price: 0, stock: 0, category: 'DOG_FOOD', imageUrl: '', active: true };
const newVariant = (): ProductVariantInput => ({ label: '', price: 0, stock: 0, active: true, sortOrder: 0 });

export default function VendorProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [variants, setVariants] = useState<ProductVariantInput[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: () => vendorApi.myProducts({ size: 50 }),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, variants };
      return editing!.approvalStatus === 'REJECTED'
        ? vendorApi.resubmitProduct(editing!.id, payload)
        : vendorApi.editProduct(editing!.id, payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-products'] }); toast.success('Product updated and submitted for review'); setEditing(null); },
    onError: () => toast.error('Failed to save product'),
  });

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, imageUrl: p.imageUrl, active: p.active });
    setVariants(p.variants.map((v) => ({ id: v.id, label: v.label, price: v.price, stock: v.stock, active: v.active, sortOrder: v.sortOrder })));
  };

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: field === 'price' || field === 'stock' ? Number(e.target.value) : e.target.value }));

  const setVariantField = (idx: number, field: keyof ProductVariantInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVariants((rows) => rows.map((r, i) => i === idx
      ? { ...r, [field]: field === 'price' || field === 'stock' ? Number(e.target.value) : field === 'active' ? e.target.checked : e.target.value }
      : r));

  const products = data?.data.data.content ?? [];

  return (
    <VendorLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <p className="text-gray-500 mt-1">{products.length} products submitted</p>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.id} className="card p-4 flex gap-4">
              <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.category.replace(/_/g, ' ')} · {formatNGN(p.price)}</p>
                  </div>
                  <StatusBadge status={p.approvalStatus} />
                </div>
                {p.approvalStatus === 'REJECTED' && p.rejectionReason && (
                  <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-700">Rejection reason</p>
                      <p className="text-xs text-red-600">{p.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => openEdit(p)} className="btn-secondary text-xs py-2 px-3 shrink-0 self-start">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-16 text-gray-400">No products yet.</div>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Edit Product</h2>
            <p className="text-sm text-gray-500 mb-5">Changes will be submitted for admin review before going live.</p>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input value={form.name} onChange={setField('name')} className="input" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={setField('description')} className="input resize-none" rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₦)</label>
                  <input type="number" value={form.price} onChange={setField('price')} className="input" min="0" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
                  <input type="number" value={form.stock} onChange={setField('stock')} className="input" min="0" required /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select value={form.category} onChange={setField('category')} className="input">
                  {['DOG_FOOD', 'CAT_FOOD', 'DOG_TREATS', 'CAT_TREATS', 'ACCESSORIES', 'CAT_ACCESSORIES'].map((c) => (
                    <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                  ))}
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                <input value={form.imageUrl} onChange={setField('imageUrl')} className="input" /></div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-800">Variants</p>
                  <button type="button" onClick={() => setVariants((r) => [...r, { ...newVariant(), sortOrder: r.length }])} className="btn-secondary text-xs py-1.5 px-3">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                {variants.map((v, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-2 mb-2">
                    <div className="flex justify-between">
                      <p className="text-xs font-semibold text-gray-600">Variant {i + 1}</p>
                      <button type="button" onClick={() => setVariants((r) => r.filter((_, idx) => idx !== i))} className="p-1 text-gray-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    <input placeholder="Label" value={v.label} onChange={setVariantField(i, 'label')} className="input text-sm" required />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="Price (₦)" value={v.price} onChange={setVariantField(i, 'price')} className="input text-sm" min="0" required />
                      <input type="number" placeholder="Stock" value={v.stock} onChange={setVariantField(i, 'stock')} className="input text-sm" min="0" required />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1">
                  {saveMutation.isPending ? 'Saving…' : 'Save & submit for review'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
