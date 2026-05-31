import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authVendorApi } from '../api/vendorApi';

export default function RegisterVendor() {
  const [form, setForm] = useState({ email: '', password: '', businessName: '', description: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authVendorApi.register(form);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application submitted!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your vendor account is under review. We'll activate it shortly — you'll then be able to log in and start listing products.
          </p>
          <Link to="/login" className="btn-primary inline-flex">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🐾</span>
            <span className="text-2xl font-bold">Lumi<span className="text-brand-600">Paws</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Become a vendor</h1>
          <p className="text-gray-500 mt-1 text-sm">Submit your application — our team will review and activate your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business name</label>
            <input value={form.businessName} onChange={set('businessName')} className="input" placeholder="PawsPlus Supplies" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business description</label>
            <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={3}
              placeholder="Tell us about your pet product business…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="you@business.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input value={form.phone} onChange={set('phone')} className="input" placeholder="+234 800 000 0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={set('password')} className="input" placeholder="Min. 8 characters" required minLength={8} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Submitting…' : 'Submit application'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already a vendor? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
