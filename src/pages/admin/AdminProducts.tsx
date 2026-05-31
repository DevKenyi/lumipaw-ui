import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi } from '../../api/products';
import { adminVendorApi } from '../../api/vendorApi';
import AdminLayout from '../../components/layout/AdminLayout';
import { formatNGN } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import ProductImage from '../../components/ui/ProductImage';
import type { Product, ProductVariantInput } from '../../types';

const EMPTY_FORM = {
  name: '', description: '', price: 0, stock: 0,
  category: 'DOG_FOOD', imageUrl: '', active: true,
};

const newVariantRow = (): ProductVariantInput => ({ label: '', price: 0, stock: 0, active: true, sortOrder: 0 });

export default function AdminProducts() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'products' | 'submissions'>('products');
  const [rejectModal, setRejectModal] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [variants, setVariants] = useState<ProductVariantInput[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.adminList({ size: 50 }),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? productsApi.update(editing.id, { ...form, variants })
        : productsApi.create({ ...form, variants }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(editing ? 'Product updated' : 'Product created');
      closeModal();
    },
    onError: () => toast.error('Failed to save product'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => productsApi.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setVariants([]);
    setModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, imageUrl: p.imageUrl, active: p.active });
    setVariants(p.variants.map((v) => ({ id: v.id, label: v.label, price: v.price, stock: v.stock, active: v.active, sortOrder: v.sortOrder })));
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); };

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: field === 'price' || field === 'stock' ? Number(e.target.value) : field === 'active' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const setVariantField = (idx: number, field: keyof ProductVariantInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setVariants((rows) => rows.map((r, i) =>
      i === idx ? { ...r, [field]: field === 'price' || field === 'stock' || field === 'sortOrder' ? Number(e.target.value) : field === 'active' ? e.target.checked : e.target.value } : r
    ));
  };

  const addVariant = () => setVariants((rows) => [...rows, { ...newVariantRow(), sortOrder: rows.length }]);
  const removeVariant = (idx: number) => setVariants((rows) => rows.filter((_, i) => i !== idx));

  const { data: pendingData } = useQuery({
    queryKey: ['admin-pending-products'],
    queryFn: () => adminVendorApi.pendingProducts({ size: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminVendorApi.approveProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pending-products'] }); qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product approved and live'); },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminVendorApi.rejectProduct(id, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pending-products'] }); toast.success('Product rejected'); setRejectModal(null); setRejectReason(''); },
  });

  const products = data?.data.data.content ?? [];
  const pendingProducts = pendingData?.data.data.content ?? [];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        </div>
        {tab === 'products' && (
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" /> Add product
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('products')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          All Products ({products.length})
        </button>
        <button onClick={() => setTab('submissions')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${tab === 'submissions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Submissions
          {pendingProducts.length > 0 && (
            <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">{pendingProducts.length}</span>
          )}
        </button>
      </div>

      {tab === 'submissions' && (
        <div className="space-y-4">
          {pendingProducts.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">No pending submissions.</div>
          ) : pendingProducts.map((p) => (
            <div key={p.id} className="card p-4 flex gap-4">
              <ProductImage src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category.replace(/_/g, ' ')} · {formatNGN(p.price)}</p>
                    {p.vendorBusinessName && (
                      <p className="text-xs text-brand-600 font-medium mt-0.5">by {p.vendorBusinessName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => approveMutation.mutate(p.id)}
                      className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                      <CheckCircle className="h-4 w-4" /> Approve
                    </button>
                    <button onClick={() => { setRejectModal(p); setRejectReason(''); }}
                      className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
                {p.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
                {p.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.variants.map((v) => (
                      <span key={v.id} className="badge bg-gray-100 text-gray-600">{v.label} — {formatNGN(v.price)}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && isLoading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : tab === 'products' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price / Variants', 'Stock', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      <p className="font-medium text-gray-900 truncate max-w-[180px]">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    {p.variants.length > 0 ? (
                      <div className="space-y-0.5">
                        {p.variants.slice(0, 3).map((v) => (
                          <p key={v.id} className="text-xs text-gray-600">
                            <span className="font-medium">{v.label}</span> — {formatNGN(v.price)}
                          </p>
                        ))}
                        {p.variants.length > 3 && <p className="text-xs text-gray-400">+{p.variants.length - 3} more</p>}
                      </div>
                    ) : (
                      <span className="font-semibold text-gray-900">{formatNGN(p.price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.variants.length > 0 ? (
                      <span className="text-xs text-gray-500">per variant</span>
                    ) : (
                      <span className={`font-medium ${p.stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>{p.stock}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleMutation.mutate(p.id)} className={`text-${p.active ? 'green' : 'gray'}-500 hover:opacity-80`}>
                      {p.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">{editing ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">

              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input value={form.name} onChange={setField('name')} className="input" required /></div>

              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={setField('description')} className="input resize-none" rows={3} /></div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Base price (₦)</label>
                  <input type="number" value={form.price} onChange={setField('price')} className="input" min="0" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Base stock</label>
                  <input type="number" value={form.stock} onChange={setField('stock')} className="input" min="0" required /></div>
              </div>

              <p className="text-xs text-gray-400">Base price/stock are used only when no variants are defined.</p>

              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select value={form.category} onChange={setField('category')} className="input">
                  {['DOG_FOOD', 'CAT_FOOD', 'DOG_TREATS', 'CAT_TREATS', 'ACCESSORIES', 'CAT_ACCESSORIES'].map((c) => (
                    <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                  ))}
                </select></div>

              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                <input value={form.imageUrl} onChange={setField('imageUrl')} className="input" placeholder="https://…" /></div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={setField('active')} className="w-4 h-4 text-brand-600 rounded" />
                <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
              </label>

              {/* Variants */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Size / Packaging variants</p>
                    <p className="text-xs text-gray-400">e.g. 2kg Bag, Single Can, Carton of 12</p>
                  </div>
                  <button type="button" onClick={addVariant} className="btn-secondary text-xs py-1.5 px-3">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>

                {variants.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-xl">
                    No variants — product sold at base price
                  </p>
                )}

                <div className="space-y-3">
                  {variants.map((v, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">Variant {i + 1}</p>
                        <button type="button" onClick={() => removeVariant(i)} className="p-1 text-gray-400 hover:text-red-500">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        placeholder="Label (e.g. 2kg Bag, Single Can)"
                        value={v.label}
                        onChange={setVariantField(i, 'label')}
                        className="input text-sm"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number" placeholder="Price (₦)" value={v.price}
                          onChange={setVariantField(i, 'price')}
                          className="input text-sm" min="0" required
                        />
                        <input
                          type="number" placeholder="Stock" value={v.stock}
                          onChange={setVariantField(i, 'stock')}
                          className="input text-sm" min="0" required
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={v.active} onChange={setVariantField(i, 'active')} className="w-3.5 h-3.5 text-brand-600 rounded" />
                        <span className="text-xs text-gray-600">Available</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1">
                  {saveMutation.isPending ? 'Saving…' : 'Save product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reject reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900">Reject product</h3>
                <p className="text-sm text-gray-500">"{rejectModal.name}"</p>
              </div>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for rejection</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input resize-none"
              rows={4}
              placeholder="Explain what needs to be corrected so the vendor can fix and resubmit…"
              required
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectModal.id, reason: rejectReason })}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Rejecting…' : 'Reject product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
