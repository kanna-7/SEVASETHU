import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, Upload } from 'lucide-react';
import { registerHome } from '../services/api';

export default function RegisterHomePage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [homeImages, setHomeImages] = useState([]);
  const [guardianPhoto, setGuardianPhoto] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    type: 'orphanage',
    description: '',
    phone: '',
    email: '',
    address: { street: '', city: '', state: '', pincode: '' },
    contactPerson: { name: '', phone: '', email: '', designation: '' },
    documents: { pan: '' },
  });

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!homeImages.length || !guardianPhoto) {
      alert('Please upload at least one home image and your guardian/manager photo before submitting.');
      return;
    }
    setLoading(true);
    const data = new FormData();
    
    // Append form data
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    });
    
    // Append files
    homeImages.forEach((file) => data.append('homeImages', file));
    data.append('guardianPhoto', guardianPhoto);

    try {
      await registerHome(data);
      setSubmitted(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to submit your registration request.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Request Sent for Approval</h1>
        <p className="text-gray-600 mt-3">
          An administrator will verify your home. Once approved, you will receive your temporary login credentials.
        </p>
        <Link to="/" className="btn-primary inline-block mt-6">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <Building2 className="w-12 h-12 text-primary-600 mx-auto mb-3" />
        <h1 className="text-3xl font-bold">Register Your Home</h1>
        <p className="text-gray-500 mt-2">
          Complete the details below to submit your home for review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Guardian Section */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-100">Guardian / Manager Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Full Name *</label>
              <input
                required
                type="text"
                placeholder="Full name"
                className="field"
                value={form.contactPerson.name}
                onChange={(e) => update('contactPerson', { ...form.contactPerson, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                required
                type="email"
                placeholder="Guardian email address"
                className="field"
                value={form.email}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((current) => ({
                    ...current,
                    email: val,
                    contactPerson: { ...current.contactPerson, email: val }
                  }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone *</label>
              <input
                required
                type="tel"
                placeholder="Phone number"
                className="field"
                value={form.contactPerson.phone}
                onChange={(e) => update('contactPerson', { ...form.contactPerson, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input
                type="text"
                placeholder="Manager / Trustee / Guardian"
                className="field"
                value={form.contactPerson.designation}
                onChange={(e) => update('contactPerson', { ...form.contactPerson, designation: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Home Details Section */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-100">Home Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Hope Orphanage"
                className="field"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                className="field"
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
              >
                <option value="orphanage">Orphanage</option>
                <option value="old_age_home">Old Age Home</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Phone *</label>
              <input
                required
                type="tel"
                placeholder="Contact number"
                className="field"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input
                type="text"
                placeholder="Permanent Account Number"
                className="field"
                value={form.documents.pan}
                onChange={(e) => update('documents', { pan: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
              <input
                required
                type="text"
                placeholder="Building number, street name"
                className="field"
                value={form.address.street}
                onChange={(e) => update('address', { ...form.address, street: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                required
                type="text"
                placeholder="City"
                className="field"
                value={form.address.city}
                onChange={(e) => update('address', { ...form.address, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                required
                type="text"
                placeholder="State"
                className="field"
                value={form.address.state}
                onChange={(e) => update('address', { ...form.address, state: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
              <input
                required
                type="text"
                placeholder="6-digit pincode"
                className="field"
                value={form.address.pincode}
                onChange={(e) => update('address', { ...form.address, pincode: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Briefly describe the home, its mission, and who it serves..."
              rows="3"
              className="field"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>
        </section>

        {/* Uploads Section */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-100">Upload Documents & Photos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image of Home *</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors flex flex-col items-center justify-center text-center cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">
                  {homeImages.length > 0 ? `${homeImages.length} images selected` : 'Select home images'}
                </span>
                <input
                  required
                  multiple
                  accept="image/*"
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setHomeImages(Array.from(e.target.files || []))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image of Guardian/Manager *</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors flex flex-col items-center justify-center text-center cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">
                  {guardianPhoto ? guardianPhoto.name : 'Select manager photo'}
                </span>
                <input
                  required
                  accept="image/*"
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setGuardianPhoto(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? 'Submitting Registration...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
}
