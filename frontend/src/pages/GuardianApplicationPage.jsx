import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, Chrome } from 'lucide-react';
import { registerHome, verifyGoogleIdentity } from '../services/api';

const blankForm = {
  name: '', type: 'orphanage', description: '', phone: '', email: '',
  address: { street: '', city: '', state: '', pincode: '' },
  contactPerson: { name: '', phone: '', email: '', designation: 'Home Guardian' },
  documents: { pan: '' },
};

export default function GuardianApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [googleStatus, setGoogleStatus] = useState('');
  const [homeImages, setHomeImages] = useState([]);
  const [guardianPhoto, setGuardianPhoto] = useState(null);
  const [form, setForm] = useState(blankForm);
  const googleButton = useRef(null);
  const verified = Boolean(verificationToken);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) { setGoogleStatus('Google sign-in has not been configured.'); return undefined; }
    const initialize = () => {
      window.google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential }) => {
        try {
          setGoogleStatus('Verifying your Google account...');
          const response = await verifyGoogleIdentity(credential);
          const { name, email, verificationToken: token } = response.data.data;
          setVerificationToken(token);
          setForm((current) => ({ ...current, email, contactPerson: { ...current.contactPerson, name: name || current.contactPerson.name, email } }));
          setGoogleStatus(`Signed in as ${email}`);
        } catch (error) { setGoogleStatus(error.response?.data?.message || 'Google sign-in could not be verified.'); }
      }});
      window.google.accounts.id.renderButton(googleButton.current, { theme: 'outline', size: 'large', text: 'continue_with', width: 280 });
    };
    const script = document.getElementById('google-identity-script');
    if (script) { if (window.google) initialize(); else script.addEventListener('load', initialize); return () => script.removeEventListener('load', initialize); }
    const newScript = document.createElement('script');
    newScript.id = 'google-identity-script'; newScript.src = 'https://accounts.google.com/gsi/client'; newScript.async = true; newScript.onload = initialize;
    document.head.appendChild(newScript);
    return undefined;
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!verificationToken) { setGoogleStatus('Please continue with Google before sending your request.'); return; }
    setLoading(true);
    if (!homeImages.length || !guardianPhoto) { setGoogleStatus('Upload at least one home image and your guardian photo before submitting.'); return; }
    const data = new FormData();
    data.append('googleVerificationToken', verificationToken);
    Object.entries(form).forEach(([key, value]) => data.append(key, typeof value === 'object' ? JSON.stringify(value) : value));
    homeImages.forEach((file) => data.append('homeImages', file));
    data.append('guardianPhoto', guardianPhoto);
    try { await registerHome(data); setSubmitted(true); }
    catch (error) { setGoogleStatus(error.response?.data?.message || 'Unable to submit your request'); }
    finally { setLoading(false); }
  };

  if (submitted) return <div className="max-w-xl mx-auto px-4 py-20 text-center"><CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" /><h1 className="text-2xl font-bold">Request sent for approval</h1><p className="text-gray-600 mt-3">An administrator will verify your home. Once approved, the administrator will share your temporary login details.</p><Link to="/" className="btn-primary inline-block mt-6">Back to home</Link></div>;

  return <div className="max-w-3xl mx-auto px-4 py-10"><div className="text-center mb-8"><Building2 className="w-11 h-11 text-primary-600 mx-auto mb-3" /><h1 className="text-3xl font-bold">Home Guardian Request</h1><p className="text-gray-500 mt-2">Verify your identity, then send your home for review.</p></div>
    <div className="card mb-6 bg-blue-50 border-blue-100"><div className="flex flex-col sm:flex-row sm:items-center gap-4"><Chrome className="w-7 h-7 text-blue-700 shrink-0" /><div className="flex-1"><p className="font-semibold text-sm">Verify your Google account</p><p className="text-sm text-gray-600">Your verified name and email are used only for this approval request.</p>{googleStatus && <p className={`text-sm mt-2 ${verified ? 'text-green-700' : 'text-blue-700'}`}>{googleStatus}</p>}</div><div ref={googleButton} /></div></div>
    <form onSubmit={submit} className="card space-y-6"><section><h2 className="font-semibold mb-3">Guardian account</h2><div className="grid sm:grid-cols-2 gap-4"><input required placeholder="Your full name *" className="field" value={form.contactPerson.name} readOnly={verified} onChange={(e) => update('contactPerson', { ...form.contactPerson, name: e.target.value })} /><input required type="email" placeholder="Google account email *" className="field bg-gray-50" value={form.email} readOnly /><input required placeholder="Guardian phone *" className="field" value={form.contactPerson.phone} onChange={(e) => update('contactPerson', { ...form.contactPerson, phone: e.target.value })} /></div></section>
      <section><h2 className="font-semibold mb-3">Home details</h2><div className="grid sm:grid-cols-2 gap-4"><input required placeholder="Home name *" className="field" value={form.name} onChange={(e) => update('name', e.target.value)} /><select className="field" value={form.type} onChange={(e) => update('type', e.target.value)}><option value="orphanage">Orphanage</option><option value="old_age_home">Old Age Home</option></select><input required placeholder="Home phone *" className="field" value={form.phone} onChange={(e) => update('phone', e.target.value)} /><input placeholder="PAN number" className="field" value={form.documents.pan} onChange={(e) => update('documents', { pan: e.target.value })} /><input required placeholder="City *" className="field" value={form.address.city} onChange={(e) => update('address', { ...form.address, city: e.target.value })} /><input required placeholder="State *" className="field" value={form.address.state} onChange={(e) => update('address', { ...form.address, state: e.target.value })} /><input placeholder="Street address" className="field sm:col-span-2" value={form.address.street} onChange={(e) => update('address', { ...form.address, street: e.target.value })} /></div><textarea placeholder="Briefly describe your home" rows="3" className="field mt-4" value={form.description} onChange={(e) => update('description', e.target.value)} /></section><section className="grid sm:grid-cols-2 gap-4"><label className="text-sm font-medium">Home images *<input required multiple accept="image/*" type="file" className="field mt-1" onChange={(e) => setHomeImages(Array.from(e.target.files || []))} /></label><label className="text-sm font-medium">Guardian photo *<input required accept="image/*" type="file" className="field mt-1" onChange={(e) => setGuardianPhoto(e.target.files?.[0] || null)} /></label></section><button disabled={loading || !verified} className="btn-primary w-full py-3 disabled:opacity-50">{loading ? 'Sending request...' : 'Send approval request'}</button></form></div>;
}
