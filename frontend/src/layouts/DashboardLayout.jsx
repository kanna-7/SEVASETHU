import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Home, Users, Package, Calendar,
  FileText, Bell, Settings, Heart, Stethoscope, CheckCircle,
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/homes', icon: Home, label: 'Homes' },
  { to: '/admin/donations', icon: Heart, label: 'Donations' },
  { to: '/admin/medical-camps', icon: Stethoscope, label: 'Medical Camps' },
  { to: '/admin/reports', icon: FileText, label: 'Reports' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

const managerLinks = [
  { to: '/manager', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/manager/residents', icon: Users, label: 'Residents' },
  { to: '/manager/inventory', icon: Package, label: 'Inventory' },
  { to: '/manager/donations', icon: Heart, label: 'Donations' },
  { to: '/manager/events', icon: Calendar, label: 'Events' },
  { to: '/manager/reports', icon: FileText, label: 'Reports' },
  { to: '/manager/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children, type = 'admin' }) {
  const { user } = useAuth();
  const location = useLocation();
  const links = type === 'admin' ? adminLinks : managerLinks;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:block">
        <div className="p-6 border-b">
          <Link to="/" className="text-primary-700 font-bold text-lg">SevaSethu</Link>
          <p className="text-xs text-gray-500 mt-1 capitalize">{type} Panel</p>
        </div>
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 capitalize">{type} Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
            </button>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-gray-500 text-xs capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
