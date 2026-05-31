import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorApi } from '../../api/vendorApi';
import VendorLayout from '../../components/layout/VendorLayout';
import type { ProductVariantInput } from '../../types';

const EMPTY_FORM = { name: '', description: '', price: 0, stock: 0, category: 'DOG_FOOD', imageUrl: '', active: true };
const newVariant = (): ProductVariantInput => ({ label: '', price: 0, stock: 0, active: true, sortOrder: 0 });

export default function VendorSubmitProduct() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [variants, setVariants] = useState<ProductVariantInput[]>([]);
  const [loading, setLoading] = useState(false);

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: field === 'price' || field === 'stock' ? Number(e.target.value) : e.target.value }));

  const setVariantField = (idx: number, field: keyof ProductVariantInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVariants((rows) => rows.map((r, i) => i === idx
      ? { ...r, [field]: field === 'price' || field === 'stock' ? Number(e.target.value) : field === 'active' ? e.target.checked : e.target.value }
      : r));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vendorApi.submitProduct({ ...form, variants });
      qc.invalidateQueries({ queryKey: ['vendor-products'] });
      toast.success('Product submitted for admin review!');
      navigate('/vendor/products');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Submission failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout>
      <div className="max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Submit a product</h1>
          <p className="text-gray-500 mt-1">Your product will be reviewed by our team before going live.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Product name</label>
            <input value={form.name} onChange={setField('name')} className="input" required /></div>

          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={setField('description')} className="input resize-none" rows={4} /></div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Base price (₦)</label>
              <input type="number" value={form.price} onChange={setField('price')} className="input" min="0" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
              <input type="number" value={form.stock} onChange={setField('stock')} className="input" min="0" required /></div>
          </div>
          <p className="text-xs text-gray-400">Base price/stock used when no variants are set below.</p>

          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select value={form.category} onChange={setField('category')} className="input">
              {['DOG_FOOD', 'CAT_FOOD', 'DOG_TREATS', 'CAT_TREATS', 'ACCESSORIES', 'CAT_ACCESSORIES'].map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select></div>

          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
            <input value={form.imageUrl} onChange={setField('imageUrl')} className="input" placeholder="https://…" /></div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Size / Packaging variants</p>
                <p className="text-xs text-gray-400">e.g. 2kg Bag, Single Can, Carton of 12</p>
              </div>
              <button type="button" onClick={() => setVariants((r) => [...r, { ...newVariant(), sortOrder: r.length }])} className="btn-secondary text-xs py-1.5 px-3">
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            {variants.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-xl">No variants — single price</p>
            )}
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-2">
                  <div className="flex justify-between">
                    <p className="text-xs font-semibold text-gray-600">Variant {i + 1}</p>
                    <button type="button" onClick={() => setVariants((r) => r.filter((_, idx) => idx !== i))} className="p-1 text-gray-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                  </div>
                  <input placeholder="Label (e.g. 2kg Bag)" value={v.label} onChange={setVariantField(i, 'label')} className="input text-sm" required />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Price (₦)" value={v.price} onChange={setVariantField(i, 'price')} className="input text-sm" min="0" required />
                    <input type="number" placeholder="Stock" value={v.stock} onChange={setVariantField(i, 'stock')} className="input text-sm" min="0" required />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/vendor/products')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting…' : 'Submit for review'}
            </button>
          </div>
        </form>
      </div>
    </VendorLayout>
  );
}
