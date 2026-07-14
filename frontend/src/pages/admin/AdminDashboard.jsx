import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import { getAdminDashboard } from '../../services/api';

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      getAdminDashboard()
        .then((res) => setStats(res.data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/login" />;

  return (
    <DashboardLayout type="admin">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-500 text-sm">Platform-wide statistics and activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {!loading && Object.entries(stats).map(([key, value]) => (
          <StatCard key={key} name={key} value={value} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/admin/homes" className="block px-4 py-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-100">
              {stats.pendingRequests || 0} Pending Home Registrations
            </a>
            <a href="/admin/donations" className="block px-4 py-3 bg-primary-50 text-primary-800 rounded-lg text-sm font-medium hover:bg-primary-100">
              Review Donations
            </a>
            <a href="/admin/medical-camps" className="block px-4 py-3 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-100">
              Approve Medical Camps
            </a>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <p className="text-sm text-gray-500">Activity feed will appear here as the platform is used.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
