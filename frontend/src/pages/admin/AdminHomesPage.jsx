import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getPendingHomes, approveHome } from '../../services/api';

export default function AdminHomesPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approval, setApproval] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      getPendingHomes()
        .then((res) => setHomes(res.data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const handleApprove = async (id, approved) => {
    try {
      const res = await approveHome(id, { approved });
      setHomes(homes.filter((h) => h._id !== id));
      if (approved) setApproval(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/login" />;

  return (
    <DashboardLayout type="admin">
      <h2 className="text-2xl font-bold mb-6">Pending Home Registrations</h2>
      {approval && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <p className="font-semibold">Approval completed — send these access details to the Home Guardian.</p>
          <p className="mt-1">Email: <strong>{approval.manager.email}</strong>{approval.temporaryPassword && <> · Temporary password: <strong>{approval.temporaryPassword}</strong></>}</p>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : homes.length > 0 ? (
        <div className="space-y-4">
          {homes.map((home) => (
            <div key={home._id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{home.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{home.type?.replace('_', ' ')} · {home.address?.city}, {home.address?.state}</p>
                  <p className="text-sm text-gray-500 mt-1">{home.phone} · {home.email}</p>
                  {home.contactPerson?.name && (
                    <p className="text-sm text-gray-500">Manager: {home.contactPerson.name}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(home._id, true)} className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => handleApprove(home._id, false)} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-500">
          <p>No pending registrations.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
