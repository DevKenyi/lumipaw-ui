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
    const effectivePrice = variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : form.price;
    const effectiveStock = variants.length > 0 ? variants.reduce((s, v) => s + v.stock, 0) : form.stock;
    try {
      await vendorApi.submitProduct({ ...form, price: effectivePrice, stock: effectiveStock, variants });
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

          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select value={form.category} onChange={setField('category')} className="input">
              {['DOG_FOOD', 'CAT_FOOD', 'DOG_TREATS', 'CAT_TREATS', 'ACCESSORIES', 'CAT_ACCESSORIES'].map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select></div>

          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
            <input value={form.imageUrl} onChange={setField('imageUrl')} className="input" placeholder="https://…" /></div>

          {/* Pricing & Sizes */}
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <p className="text-sm font-semibold text-gray-800">Pricing & Stock</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVariants([])}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all text-center ${
                  variants.length === 0
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">1️⃣</span>
                <span className="text-sm font-semibold">One version</span>
                <span className="text-xs leading-tight">Same price for everyone — e.g. a leash, a bowl</span>
              </button>
              <button
                type="button"
                onClick={() => { if (variants.length === 0) setVariants([{ ...newVariant(), sortOrder: 0 }]); }}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all text-center ${
                  variants.length > 0
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">📦</span>
                <span className="text-sm font-semibold">Different sizes</span>
                <span className="text-xs leading-tight">e.g. 2kg bag, 5kg bag — each with its own price</span>
              </button>
            </div>

            {variants.length === 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₦)</label>
                  <input type="number" value={form.price} onChange={setField('price')} className="input" min="0" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">How many in stock</label>
                  <input type="number" value={form.stock} onChange={setField('stock')} className="input" min="0" required />
                </div>
              </div>
            )}

            {variants.length > 0 && (
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">{v.label || `Size ${i + 1}`}</p>
                      <button type="button" onClick={() => setVariants((r) => r.filter((_, idx) => idx !== i))} className="p-1 text-gray-400 hover:text-red-500 rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Size or package name</label>
                      <input placeholder="e.g. 2kg Bag, Small, Large, Carton of 12" value={v.label} onChange={setVariantField(i, 'label')} className="input text-sm" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Price for this size (₦)</label>
                        <input type="number" value={v.price} onChange={setVariantField(i, 'price')} className="input text-sm" min="0" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">How many in stock</label>
                        <input type="number" value={v.stock} onChange={setVariantField(i, 'stock')} className="input text-sm" min="0" required />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setVariants((r) => [...r, { ...newVariant(), sortOrder: r.length }])}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add another size
                </button>
              </div>
            )}
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
