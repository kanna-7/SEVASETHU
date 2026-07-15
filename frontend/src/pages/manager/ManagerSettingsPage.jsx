import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Settings, Upload, CheckCircle2, Building, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getManagerDashboard, updateMyHome } from '../../services/api';

export default function ManagerSettingsPage() {
  const { isManager, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    type: 'orphanage',
    description: '',
    phone: '',
    email: '',
    address: { street: '', city: '', state: '', pincode: '' },
    googleMapsUrl: '',
    contactPerson: { name: '', phone: '', email: '', designation: '', photo: '' },
    documents: { pan: '' },
  });

  const [guardianPhoto, setGuardianPhoto] = useState(null);
  const [homeImages, setHomeImages] = useState([]);
  
  // For previews
  const [guardianPhotoPreview, setGuardianPhotoPreview] = useState(null);

  useEffect(() => {
    if (isManager) {
      getManagerDashboard()
        .then((res) => {
          const home = res.data.data.home;
          if (home) {
            setForm({
              name: home.name || '',
              type: home.type || 'orphanage',
              description: home.description || '',
              phone: home.phone || '',
              email: home.email || '',
              googleMapsUrl: home.googleMapsUrl || '',
              address: {
                street: home.address?.street || '',
                city: home.address?.city || '',
                state: home.address?.state || '',
                pincode: home.address?.pincode || '',
              },
              contactPerson: {
                name: home.contactPerson?.name || '',
                phone: home.contactPerson?.phone || '',
                email: home.contactPerson?.email || '',
                designation: home.contactPerson?.designation || '',
                photo: home.contactPerson?.photo || '',
              },
              documents: {
                pan: home.documents?.pan || '',
              },
            });
            if (home.contactPerson?.photo) {
              setGuardianPhotoPreview(home.contactPerson.photo);
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isManager]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleGuardianPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setGuardianPhoto(file);
      setGuardianPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });

      if (guardianPhoto) {
        data.append('guardianPhoto', guardianPhoto);
      }
      if (homeImages.length > 0) {
        homeImages.forEach((img) => data.append('homeImages', img));
      }

      const res = await updateMyHome(data);
      const updatedHome = res.data.data;
      setSuccessMsg('Settings updated successfully!');
      
      // Update form state with the newly returned home details
      if (updatedHome) {
        setForm({
          name: updatedHome.name || '',
          type: updatedHome.type || 'orphanage',
          description: updatedHome.description || '',
          phone: updatedHome.phone || '',
          email: updatedHome.email || '',
          googleMapsUrl: updatedHome.googleMapsUrl || '',
          address: {
            street: updatedHome.address?.street || '',
            city: updatedHome.address?.city || '',
            state: updatedHome.address?.state || '',
            pincode: updatedHome.address?.pincode || '',
          },
          contactPerson: {
            name: updatedHome.contactPerson?.name || '',
            phone: updatedHome.contactPerson?.phone || '',
            email: updatedHome.contactPerson?.email || '',
            designation: updatedHome.contactPerson?.designation || '',
            photo: updatedHome.contactPerson?.photo || '',
          },
          documents: {
            pan: updatedHome.documents?.pan || '',
          },
        });
      }
      
      if (updatedHome.contactPerson?.photo) {
        setGuardianPhotoPreview(updatedHome.contactPerson.photo);
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;
  if (!isManager) return <Navigate to="/login" />;

  return (
    <DashboardLayout type="manager">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-7 h-7 text-primary-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500 font-medium">Update organization details and guardian profile</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-sm text-green-900 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading settings...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          {/* Guardian Profile Section */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-600" /> Guardian / Manager Profile
            </h3>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Photo Preview & Edit */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border border-gray-200 mb-3 flex items-center justify-center relative group">
                  {guardianPhotoPreview ? (
                    <img src={guardianPhotoPreview} alt="Guardian Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 font-bold text-3xl uppercase">
                      {form.contactPerson.name?.charAt(0) || 'G'}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium">
                    <Upload className="w-4 h-4 mr-1" /> Change
                    <input
                      accept="image/*"
                      type="file"
                      className="hidden"
                      onChange={handleGuardianPhotoChange}
                    />
                  </label>
                </div>
                <span className="text-xs text-gray-500">Guardian Photo</span>
              </div>

              {/* Form Input fields */}
              <div className="flex-1 grid sm:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name *</label>
                  <input
                    required
                    type="text"
                    className="field"
                    value={form.contactPerson.name}
                    onChange={(e) => update('contactPerson', { ...form.contactPerson, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Director"
                    className="field"
                    value={form.contactPerson.designation}
                    onChange={(e) => update('contactPerson', { ...form.contactPerson, designation: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone *</label>
                  <input
                    required
                    type="tel"
                    className="field"
                    value={form.contactPerson.phone}
                    onChange={(e) => update('contactPerson', { ...form.contactPerson, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Email *</label>
                  <input
                    required
                    disabled
                    type="email"
                    className="field bg-gray-50 text-gray-500 cursor-not-allowed"
                    value={form.contactPerson.email}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Home Organization Details Section */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary-600" /> Home Organization Details
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Name *</label>
                <input
                  required
                  type="text"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  required
                  type="tel"
                  className="field"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  required
                  type="email"
                  className="field"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                <input
                  type="text"
                  className="field"
                  value={form.documents.pan}
                  onChange={(e) => update('documents', { pan: e.target.value })}
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="field"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4 mt-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
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
                    className="field"
                    value={form.address.pincode}
                    onChange={(e) => update('address', { ...form.address, pincode: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Location Link</label>
                  <input
                    type="url"
                    placeholder="https://maps.app.goo.gl/..."
                    className="field"
                    value={form.googleMapsUrl || ''}
                    onChange={(e) => update('googleMapsUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upload additional images */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-600" /> Upload Additional Home Images
            </h3>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-500 transition-colors flex flex-col items-center justify-center text-center cursor-pointer bg-white">
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm font-semibold text-gray-700">Drag files here or click to browse</span>
              <span className="text-xs text-gray-500 mt-1">
                {homeImages.length > 0 ? `${homeImages.length} files selected` : 'Select building, rooms, or kitchen images'}
              </span>
              <input
                multiple
                accept="image/*"
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setHomeImages(Array.from(e.target.files || []))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 py-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-3 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? 'Saving changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
