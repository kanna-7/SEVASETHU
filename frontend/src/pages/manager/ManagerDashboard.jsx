import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import { getManagerDashboard } from '../../services/api';

export default function ManagerDashboard() {
  const { isManager, loading: authLoading } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isManager) {
      getManagerDashboard()
        .then((res) => setData(res.data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isManager]);

  if (authLoading) return null;
  if (!isManager) return <Navigate to="/login" />;

  const { home, totalResidents, totalDonations, totalDonationAmount, lowStockItems, upcomingEvents, unreadNotifications } = data;

  return (
    <DashboardLayout type="manager">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{home?.name || 'My Home'}</h2>
        <p className="text-gray-500 text-sm capitalize">{home?.type?.replace('_', ' ')} · {home?.address?.city}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard name="totalResidents" value={totalResidents} />
        <StatCard name="totalDonationAmount" value={totalDonationAmount} />
        <StatCard name="totalHomes" value={totalDonations} />
        <StatCard name="activeVolunteers" value={upcomingEvents} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Alerts</h3>
          {lowStockItems > 0 ? (
            <Link to="/manager/inventory" className="block px-4 py-3 bg-orange-50 text-orange-800 rounded-lg text-sm font-medium">
              {lowStockItems} items low on stock
            </Link>
          ) : (
            <p className="text-sm text-gray-500">No alerts</p>
          )}
          {unreadNotifications > 0 && (
            <p className="text-sm text-primary-600 mt-2">{unreadNotifications} unread notifications</p>
          )}
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/manager/residents" className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-center">Add Resident</Link>
            <Link to="/manager/inventory" className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-center">Update Stock</Link>
            <Link to="/manager/events" className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-center">Create Event</Link>
            <Link to="/manager/reports" className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-center">View Reports</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
