import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, Upload } from 'lucide-react';
import { registerHome } from '../services/api';

const blankForm = {
  name: '', type: 'orphanage', description: '', phone: '', email: '',
  address: { street: '', city: '', state: '', pincode: '' },
  contactPerson: { name: '', phone: '', email: '', designation: 'Home Guardian' },
  documents: { pan: '' },
};

export default function GuardianApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [homeImages, setHomeImages] = useState([]);
  const [guardianPhoto, setGuardianPhoto] = useState(null);
  const [form, setForm] = useState(blankForm);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!homeImages.length || !guardianPhoto) {
      setErrorMsg('Upload at least one home image and your guardian photo before submitting.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, typeof value === 'object' ? JSON.stringify(value) : value));
    homeImages.forEach((file) => data.append('homeImages', file));
    data.append('guardianPhoto', guardianPhoto);
    try { 
      await registerHome(data); 
      setSubmitted(true); 
    } catch (error) { 
      setErrorMsg(error.response?.data?.message || 'Unable to submit your request'); 
    } finally { 
      setLoading(false); 
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Request sent for approval</h1>
        <p className="text-gray-600 mt-3">
          An administrator will verify your home. Once approved, the administrator will share your temporary login details.
        </p>
        <Link to="/" className="btn-primary inline-block mt-6">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <Building2 className="w-11 h-11 text-primary-600 mx-auto mb-3" />
        <h1 className="text-3xl font-bold">Home Guardian Request</h1>
        <p className="text-gray-500 mt-2">Send your home details for admin review.</p>
      </div>
      
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={submit} className="card space-y-6">
        <section>
          <h2 className="font-semibold mb-3">Guardian account</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input 
              required 
              placeholder="Your full name *" 
              className="field" 
              value={form.contactPerson.name} 
              onChange={(e) => {
                const val = e.target.value;
                setForm((current) => ({
                  ...current,
                  contactPerson: { ...current.contactPerson, name: val }
                }));
              }} 
            />
            <input 
              required 
              type="email" 
              placeholder="Your email address *" 
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
            <input 
              required 
              placeholder="Guardian phone *" 
              className="field" 
              value={form.contactPerson.phone} 
              onChange={(e) => {
                const val = e.target.value;
                setForm((current) => ({
                  ...current,
                  contactPerson: { ...current.contactPerson, phone: val }
                }));
              }} 
            />
          </div>
        </section>
        
        <section>
          <h2 className="font-semibold mb-3">Home details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input required placeholder="Home name *" className="field" value={form.name} onChange={(e) => update('name', e.target.value)} />
            <select className="field" value={form.type} onChange={(e) => update('type', e.target.value)}>
              <option value="orphanage">Orphanage</option>
              <option value="old_age_home">Old Age Home</option>
            </select>
            <input required placeholder="Home phone *" className="field" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            <input placeholder="PAN number" className="field" value={form.documents.pan} onChange={(e) => update('documents', { pan: e.target.value })} />
            <input required placeholder="City *" className="field" value={form.address.city} onChange={(e) => update('address', { ...form.address, city: e.target.value })} />
            <input required placeholder="State *" className="field" value={form.address.state} onChange={(e) => update('address', { ...form.address, state: e.target.value })} />
            <input placeholder="Street address" className="field sm:col-span-2" value={form.address.street} onChange={(e) => update('address', { ...form.address, street: e.target.value })} />
          </div>
          <textarea placeholder="Briefly describe your home" rows="3" className="field mt-4" value={form.description} onChange={(e) => update('description', e.target.value)} />
        </section>

        <section className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-medium">
            Home images *
            <input required multiple accept="image/*" type="file" className="field mt-1" onChange={(e) => setHomeImages(Array.from(e.target.files || []))} />
          </label>
          <label className="text-sm font-medium">
            Guardian photo *
            <input required accept="image/*" type="file" className="field mt-1" onChange={(e) => setGuardianPhoto(e.target.files?.[0] || null)} />
          </label>
        </section>

        <button disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
          {loading ? 'Sending request...' : 'Send approval request'}
        </button>
      </form>
    </div>
  );
}
