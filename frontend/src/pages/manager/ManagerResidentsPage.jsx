import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Upload, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getResidents, createResident } from '../../services/api';

const blankForm = {
  name: '',
  gender: 'male',
  age: '',
  bloodGroup: '',
  mobile: '',
  dateOfBirth: '',
  aadhaarAvailable: false,
  disability: '',
  emergencyContact: { name: '', phone: '' },
};

export default function ManagerResidentsPage() {
  const { isManager, loading: authLoading } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    if (isManager) {
      getResidents()
        .then((res) => setResidents(res.data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isManager]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      
      // Append form fields
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });
      
      // Override age to number
      data.set('age', Number(form.age));

      // Append photo if selected
      if (photo) {
        data.append('photo', photo);
      }

      const res = await createResident(data);
      setResidents([...residents, res.data.data]);
      setShowForm(false);
      setPhoto(null);
      setForm(blankForm);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add resident');
    }
  };

  if (authLoading) return null;
  if (!isManager) return <Navigate to="/login" />;

  return (
    <DashboardLayout type="manager">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Residents</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Resident
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card mb-6 grid sm:grid-cols-3 gap-4">
          <input required placeholder="Name *" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          
          <select className="field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          
          <input required type="number" placeholder="Age *" className="field" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          
          <input type="date" aria-label="Date of birth" className="field" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          
          <input placeholder="Blood group" className="field" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
          
          <input placeholder="Mobile number" className="field" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          
          <input placeholder="Disability / support needs" className="field" value={form.disability} onChange={(e) => setForm({ ...form, disability: e.target.value })} />
          
          <input placeholder="Emergency contact name" className="field" value={form.emergencyContact.name} onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })} />
          
          <input placeholder="Emergency contact phone" className="field" value={form.emergencyContact.phone} onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })} />
          
          {/* Photo upload field */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Resident Photo</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg px-3 py-1.5 hover:border-primary-500 transition-colors flex items-center justify-center gap-2 cursor-pointer bg-white text-sm">
              <Upload className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 truncate">
                {photo ? photo.name : 'Choose resident photo...'}
              </span>
              <input
                accept="image/*"
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm sm:col-span-3 py-1">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.aadhaarAvailable} onChange={(e) => setForm({ ...form, aadhaarAvailable: e.target.checked })} /> 
              Aadhaar available
            </label>
          </div>

          <div className="sm:col-span-3 flex justify-end gap-2">
            <button type="button" onClick={() => { setShowForm(false); setPhoto(null); }} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm">Save Resident</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : residents.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Gender</th>
                <th className="pb-3 font-medium">Age</th>
                <th className="pb-3 font-medium">Blood Group</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((r) => (
                <tr key={r._id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 text-gray-500 font-mono">{r.residentId}</td>
                  <td className="py-3 font-medium flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center">
                      {r.photo ? (
                        <img 
                          src={r.photo} 
                          alt={r.name} 
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop';
                          }}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <span>{r.name}</span>
                  </td>
                  <td className="py-3 capitalize">{r.gender}</td>
                  <td className="py-3">{r.age}</td>
                  <td className="py-3">{r.bloodGroup || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-500">
          <p>No residents added yet.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
