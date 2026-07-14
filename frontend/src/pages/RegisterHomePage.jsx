import { useState } from 'react';
import { Building2, CheckCircle } from 'lucide-react';
import { registerHome } from '../services/api';

export default function RegisterHomePage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'orphanage', description: '',
    phone: '', email: '',
    address: { street: '', city: '', state: '', pincode: '' },
    contactPerson: { name: '', phone: '', email: '', designation: 'Manager' },
    documents: { pan: '' },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerHome(form);
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
        <p className="text-gray-600">Your home registration is pending admin verification. You'll receive login credentials once approved.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <Building2 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Register Your Home</h1>
        <p className="text-gray-600">Join SevaSethu to connect with donors and improve transparency.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Organization Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Home Name *</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="orphanage">Orphanage</option>
                <option value="old_age_home">Old Age Home</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PAN Number</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.documents.pan} onChange={(e) => setForm({ ...form, documents: { ...form.documents, pan: e.target.value } })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Contact & Address</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input required type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input required type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State *</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Street</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.address.street} onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.address.pincode} onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Manager Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Manager Name *</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.contactPerson.name} onChange={(e) => setForm({ ...form, contactPerson: { ...form.contactPerson, name: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Manager Phone *</label>
              <input required type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.contactPerson.phone} onChange={(e) => setForm({ ...form, contactPerson: { ...form.contactPerson, phone: e.target.value } })} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
}
