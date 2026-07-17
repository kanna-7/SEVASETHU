import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Users, UserCheck, Mail, Phone, Shield, Home, Calendar,
  Search, Filter, ChevronDown, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getAdminUsers, getAdminVolunteers } from '../../services/api';

const ROLE_STYLES = {
  admin: 'bg-red-100 text-red-700',
  super_admin: 'bg-purple-100 text-purple-700',
  home_manager: 'bg-blue-100 text-blue-700',
  medical_partner: 'bg-teal-100 text-teal-700',
  volunteer: 'bg-green-100 text-green-700',
  donor: 'bg-gray-100 text-gray-600',
};

const VOL_STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
};

export default function AdminUsersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      Promise.all([getAdminUsers(), getAdminVolunteers()])
        .then(([usersRes, volRes]) => {
          setUsers(usersRes.data.data || []);
          setVolunteers(volRes.data.data || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredVolunteers = volunteers.filter((v) => {
    return (
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.includes(search)
    );
  });

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/login" />;

  return (
    <DashboardLayout type="admin">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-primary-600" />
          Users & Volunteers
        </h2>
        <p className="text-sm text-gray-500 mt-1">All registered users and volunteer submissions</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-700">{users.length}</p>
          <p className="text-sm text-blue-600 mt-0.5">Total Users</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700">{volunteers.length}</p>
          <p className="text-sm text-green-600 mt-0.5">Volunteers Registered</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-700">
            {users.filter((u) => u.role === 'home_manager').length}
          </p>
          <p className="text-sm text-purple-600 mt-0.5">Home Managers</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-700">
            {volunteers.filter((v) => v.status === 'active').length}
          </p>
          <p className="text-sm text-yellow-600 mt-0.5">Active Volunteers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'volunteers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="w-4 h-4 inline mr-2" />
          Volunteers ({volunteers.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === 'users' ? 'users' : 'volunteers'} by name, email or phone...`}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        {activeTab === 'users' && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white appearance-none"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="home_manager">Home Manager</option>
              <option value="medical_partner">Medical Partner</option>
              <option value="volunteer">Volunteer</option>
              <option value="donor">Donor</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'users' ? (
        /* USERS TABLE */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Home</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <span className="text-primary-700 font-bold text-sm">
                                {user.name?.[0]?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                            <p className="text-xs text-gray-400">{user._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ROLE_STYLES[user.role] || 'bg-gray-100 text-gray-600'}`}>
                          {user.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {user.home ? (
                          <span className="flex items-center gap-1 text-sm text-gray-700">
                            <Home className="w-3.5 h-3.5 text-gray-400" />
                            {user.home.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`flex items-center gap-1 text-xs font-semibold ${user.isActive ? 'text-green-600' : 'text-red-500'}`}>
                          {user.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* VOLUNTEERS TABLE */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {filteredVolunteers.length === 0 ? (
            <div className="text-center py-16">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No volunteers registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Volunteer</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Skills</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Availability</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferred Home</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVolunteers.map((vol) => (
                    <tr key={vol._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-700 font-bold text-sm">
                              {vol.name?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{vol.name}</p>
                            {vol.age && <p className="text-xs text-gray-400">Age: {vol.age}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {vol.email}
                          </p>
                          <p className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {vol.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(vol.skills || []).slice(0, 3).map((skill, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                              {skill}
                            </span>
                          ))}
                          {vol.skills?.length > 3 && (
                            <span className="text-xs text-gray-400">+{vol.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">{vol.availability || '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        {vol.preferredHome ? (
                          <span className="flex items-center gap-1 text-sm text-gray-700">
                            <Home className="w-3.5 h-3.5 text-gray-400" />
                            {vol.preferredHome.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Any</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${VOL_STATUS_STYLES[vol.status] || 'bg-gray-100 text-gray-600'}`}>
                          {vol.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
