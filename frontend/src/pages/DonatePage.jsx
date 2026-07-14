import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, CheckCircle } from 'lucide-react';
import { createDonation, getHomes } from '../services/api';

const purposes = [
  { value: 'general', label: 'General Donation' },
  { value: 'meals', label: 'Sponsor Meals' },
  { value: 'medical_camp', label: 'Sponsor Medical Camp' },
  { value: 'education', label: 'Sponsor Education' },
  { value: 'medicines', label: 'Sponsor Medicines' },
  { value: 'items', label: 'Donate Items' },
];

export default function DonatePage() {
  const [searchParams] = useSearchParams();
  const [homes, setHomes] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: '',
    purpose: 'general',
    home: searchParams.get('home') || '',
    paymentMethod: 'upi',
    isAnonymous: false,
  });

  useEffect(() => {
    getHomes().then((res) => setHomes(res.data.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createDonation({ ...form, amount: Number(form.amount) });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Donation failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-6">Your donation has been recorded. A receipt and certificate will be sent to your email.</p>
        <button onClick={() => setSubmitted(false)} className="btn-primary">Donate Again</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <Heart className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Make a Donation</h1>
        <p className="text-gray-600">No login required. Your contribution makes a real difference.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
            <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.donorName} onChange={(e) => setForm({ ...form, donorName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.donorEmail} onChange={(e) => setForm({ ...form, donorEmail: e.target.value })} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.donorPhone} onChange={(e) => setForm({ ...form, donorPhone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input required type="number" min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
            {purposes.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Home</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.home} onChange={(e) => setForm({ ...form, home: e.target.value })}>
            <option value="">General Fund</option>
            {homes.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} />
          Donate anonymously
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-50">
          {loading ? 'Processing...' : 'Confirm Donation'}
        </button>
      </form>
    </div>
  );
}
