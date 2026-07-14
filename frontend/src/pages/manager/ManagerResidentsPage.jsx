import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getResidents, createResident } from '../../services/api';

export default function ManagerResidentsPage() {
  const { isManager, loading: authLoading } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', gender: 'male', age: '', bloodGroup: '', mobile: '', dateOfBirth: '', aadhaarAvailable: false, disability: '', emergencyContact: { name: '', phone: '' } });

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
      const res = await createResident({ ...form, age: Number(form.age) });
      setResidents([...residents, res.data.data]);
      setShowForm(false);
      setForm({ name: '', gender: 'male', age: '', bloodGroup: '', mobile: '', dateOfBirth: '', aadhaarAvailable: false, disability: '', emergencyContact: { name: '', phone: '' } });
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
          <input required placeholder="Name" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input required type="number" placeholder="Age" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <input type="date" aria-label="Date of birth" className="field" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          <input placeholder="Blood group" className="field" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
          <input placeholder="Mobile number" className="field" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <input placeholder="Disability / support needs" className="field" value={form.disability} onChange={(e) => setForm({ ...form, disability: e.target.value })} />
          <input placeholder="Emergency contact name" className="field" value={form.emergencyContact.name} onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })} />
          <input placeholder="Emergency contact phone" className="field" value={form.emergencyContact.phone} onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.aadhaarAvailable} onChange={(e) => setForm({ ...form, aadhaarAvailable: e.target.checked })} /> Aadhaar available</label>
          <button type="submit" className="btn-primary text-sm">Save</button>
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
                <tr key={r._id} className="border-b last:border-0">
                  <td className="py-3 text-gray-500">{r.residentId}</td>
                  <td className="py-3 font-medium">{r.name}</td>
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
