import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Upload, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorApi, type BulkPreviewItem, type BulkUploadPreviewResponse } from '../../api/vendorApi';
import VendorLayout from '../../components/layout/VendorLayout';
import Spinner from '../../components/ui/Spinner';
import { formatNGN } from '../../utils/format';

export default function VendorBulkUpload() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<BulkUploadPreviewResponse | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const downloadMutation = useMutation({
    mutationFn: () => vendorApi.downloadBulkTemplate(),
    onSuccess: (res) => {
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => toast.error('Failed to download template'),
  });

  const previewMutation = useMutation({
    mutationFn: (file: File) => vendorApi.bulkPreview(file),
    onSuccess: (res) => setPreview(res.data.data),
    onError: () => toast.error('Failed to parse file — make sure it is a valid .xlsx'),
  });

  const confirmMutation = useMutation({
    mutationFn: (rows: BulkPreviewItem[]) => vendorApi.bulkConfirm(rows),
    onSuccess: (res) => {
      const { created, updated } = res.data.data;
      toast.success(`${created} created, ${updated} updated — all pending review`);
      setPreview(null);
      setFileName('');
      if (fileRef.current) fileRef.current.value = '';
      qc.invalidateQueries({ queryKey: ['vendor-products'] });
    },
    onError: () => toast.error('Failed to submit products'),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx')) {
      toast.error('Please upload an .xlsx file');
      return;
    }
    setFileName(file.name);
    setPreview(null);
    previewMutation.mutate(file);
  };

  const validRows = preview?.items.filter((it) => !it.error) ?? [];

  return (
    <VendorLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Product Upload</h1>
        <p className="text-gray-500 mt-1">Upload multiple products at once using an Excel sheet</p>
      </div>

      {/* Instructions card */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">How it works</h2>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>Download the Excel template below</li>
          <li>Fill in your products — leave the <code className="bg-gray-100 px-1 rounded text-xs">id</code> column blank for new products</li>
          <li>To update an existing product, paste its ID in the <code className="bg-gray-100 px-1 rounded text-xs">id</code> column</li>
          <li>Upload the filled sheet and review the preview</li>
          <li>Confirm to submit all valid rows for admin review</li>
        </ol>

        <button
          onClick={() => downloadMutation.mutate()}
          disabled={downloadMutation.isPending}
          className="btn-secondary mt-5"
        >
          {downloadMutation.isPending ? <Spinner size="sm" /> : <Download className="h-4 w-4" />}
          Download template
        </button>
      </div>

      {/* Upload area */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Upload your sheet</h2>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-12 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700">Click to select an .xlsx file</p>
          {fileName && <p className="text-xs text-gray-400 mt-1">{fileName}</p>}
          <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={handleFile} />
        </label>

        {previewMutation.isPending && (
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
            <Spinner size="sm" /> Parsing file…
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="card mb-6">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900">Preview</h2>
              <div className="flex gap-4 mt-1 text-sm">
                <span className="text-green-600 font-medium">{preview.newCount} new</span>
                <span className="text-blue-600 font-medium">{preview.updateCount} updates</span>
                {preview.errorCount > 0 && (
                  <span className="text-red-500 font-medium">{preview.errorCount} errors (will be skipped)</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setPreview(null); setFileName(''); if (fileRef.current) fileRef.current.value = ''; }}
                className="btn-secondary text-sm"
              >
                <X className="h-4 w-4" /> Clear
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="btn-secondary text-sm"
              >
                <RefreshCw className="h-4 w-4" /> Re-upload
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {preview.items.map((item, i) => (
                  <tr key={i} className={item.error ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${item.action === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{item.category?.replace(/_/g, ' ') || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{item.price ? formatNGN(item.price) : '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{item.stock ?? '—'}</td>
                    <td className="px-4 py-3">
                      {item.error ? (
                        <div className="flex items-center gap-1.5 text-red-600 text-xs">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {item.error}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-green-600 text-xs">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Valid
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {validRows.length > 0 && (
            <div className="p-5 border-t border-gray-100">
              <button
                onClick={() => confirmMutation.mutate(validRows)}
                disabled={confirmMutation.isPending}
                className="btn-primary"
              >
                {confirmMutation.isPending ? <Spinner size="sm" /> : <CheckCircle className="h-4 w-4" />}
                Submit {validRows.length} product{validRows.length !== 1 ? 's' : ''} for review
              </button>
              {preview.errorCount > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {preview.errorCount} row{preview.errorCount !== 1 ? 's' : ''} with errors will be skipped.
                </p>
              )}
            </div>
          )}

          {validRows.length === 0 && (
            <div className="p-5 border-t border-gray-100 text-sm text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              No valid rows to submit. Fix the errors in your sheet and re-upload.
            </div>
          )}
        </div>
      )}
    </VendorLayout>
  );
}
