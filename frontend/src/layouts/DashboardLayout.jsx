import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { getNotifications } from '../services/api';
import {
  LayoutDashboard, Home, Users, Package, Calendar,
  FileText, Bell, Settings, Heart, Stethoscope, LogOut,
  UserCheck, Menu, X,
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/homes', icon: Home, label: 'Homes' },
  { to: '/admin/donations', icon: Heart, label: 'Donations' },
  { to: '/admin/medical-camps', icon: Stethoscope, label: 'Medical Camps' },
  { to: '/admin/reports', icon: FileText, label: 'Reports' },
  { to: '/admin/users', icon: Users, label: 'Users & Volunteers' },
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
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const links = type === 'admin' ? adminLinks : managerLinks;
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch unread notification count for managers
  useEffect(() => {
    if (type === 'manager') {
      getNotifications()
        .then((res) => {
          const unread = (res.data.data || []).filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [type]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100">
        <Link to="/" className="text-primary-700 font-bold text-lg">SevaSethu</Link>
        <p className="text-xs text-gray-500 mt-1 capitalize">{type === 'admin' ? 'Admin' : 'Manager'} Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.to;
          const isEvents = link.to === '/manager/events';
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                {link.label}
              </span>
              {isEvents && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
            <p className="text-gray-400 text-xs capitalize truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-xl z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 capitalize">
              {type === 'admin' ? 'Admin' : 'Manager'} Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            {type === 'manager' ? (
              <Link
                to="/manager/events"
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
            )}

            {/* User avatar */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-bold text-xs">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-sm hidden md:block">
                <p className="font-medium text-gray-900 leading-tight">{user?.name}</p>
                <p className="text-gray-400 text-xs capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
