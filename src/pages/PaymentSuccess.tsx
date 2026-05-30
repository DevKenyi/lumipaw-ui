import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { paymentsApi } from '../api/payments';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const reference = params.get('reference');
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    if (!reference) { setStatus('failed'); return; }
    paymentsApi.verify(reference)
      .then(() => setStatus('success'))
      .catch(() => setStatus('failed'));
  }, [reference]);

  if (status === 'verifying') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-brand-600 animate-spin" />
        <p className="text-gray-600 font-medium">Confirming your payment…</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="p-5 rounded-full bg-red-50">
          <span className="text-5xl">❌</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment failed</h1>
        <p className="text-gray-500">Something went wrong with your payment. Please try again.</p>
        <Link to="/cart" className="btn-primary">Back to cart</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="p-5 rounded-full bg-green-50">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment successful! 🎉</h1>
        <p className="text-gray-500 max-w-sm">
          Your order has been confirmed. We've sent a confirmation email with your invoice.
        </p>
      </div>
      <div className="flex gap-3">
        <Link to="/orders" className="btn-primary">View my orders</Link>
        <Link to="/products" className="btn-secondary">Continue shopping</Link>
      </div>
    </div>
  );
}
