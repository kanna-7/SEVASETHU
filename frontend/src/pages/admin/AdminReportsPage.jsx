import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FileText, Search, Home, Users, TrendingUp, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getResidents, getApprovedHomes } from '../../services/api';

const SCHEME_KEYS = [
  { key: 'oldAgePension', label: 'Old Age Pension', icon: '💰', eligibleAge: 60 },
  { key: 'widowPension', label: 'Widow Pension', icon: '💳', eligibleGender: 'female' },
  { key: 'disabilityPension', label: 'Disability Pension', icon: '♿', requiresDisability: true },
  { key: 'ayushmanBharat', label: 'Ayushman Bharat', icon: '🏥', eligibleAll: true },
  { key: 'rationCard', label: 'Ration Card', icon: '🌾', eligibleAll: true },
  { key: 'arogyasri', label: 'Arogyasri', icon: '🩺', eligibleAll: true },
];

const STATUS_CONFIG = {
  eligible: { label: 'Eligible', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', badge: 'bg-green-100 text-green-700' },
  applied: { label: 'Applied', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved ✓', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
  not_eligible: { label: 'Not Eligible', icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-50', badge: 'bg-gray-100 text-gray-500' },
};

function getEligibleSchemes(resident) {
  const eligible = [];
  const age = resident.age || 0;
  const gender = resident.gender;
  const hasDisability = !!resident.disability && resident.disability !== 'none';

  if (age >= 60) eligible.push('oldAgePension');
  if (gender === 'female' && age >= 40) eligible.push('widowPension');
  if (hasDisability) eligible.push('disabilityPension');
  eligible.push('ayushmanBharat', 'rationCard', 'arogyasri');

  return eligible;
}

function SchemeStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.eligible;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${config.badge}`}>
      {config.label}
    </span>
  );
}

export default function AdminReportsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [residents, setResidents] = useState([]);
  const [homes, setHomes] = useState([]);
  const [selectedHome, setSelectedHome] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedResident, setExpandedResident] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      Promise.all([getResidents(), getApprovedHomes()])
        .then(([resRes, homesRes]) => {
          setResidents(resRes.data.data || []);
          setHomes(homesRes.data.data || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const filtered = residents.filter((r) => {
    const matchHome = !selectedHome || r.home?._id === selectedHome || r.home === selectedHome;
    const matchSearch = !search || r.name?.toLowerCase().includes(search.toLowerCase());
    return matchHome && matchSearch;
  });

  // Summary stats
  const totalResidents = filtered.length;
  const approvedSchemes = filtered.reduce((acc, r) => {
    return acc + Object.values(r.governmentSchemes || {}).filter(
      (s) => s?.status === 'approved'
    ).length;
  }, 0);
  const pendingSchemes = filtered.reduce((acc, r) => {
    const eligible = getEligibleSchemes(r);
    return acc + eligible.filter((key) => {
      const status = r.governmentSchemes?.[key]?.status;
      return !status || status === 'eligible';
    }).length;
  }, 0);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/login" />;

  return (
    <DashboardLayout type="admin">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary-600" />
          Scheme Eligibility Reports
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Home-wise resident scheme eligibility, application status, and funding details
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-700">{totalResidents}</p>
          <p className="text-sm text-blue-600 mt-0.5">Residents in View</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700">{approvedSchemes}</p>
          <p className="text-sm text-green-600 mt-0.5">Schemes Approved</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-700">{pendingSchemes}</p>
          <p className="text-sm text-yellow-600 mt-0.5">Pending Action</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-700">{homes.length}</p>
          <p className="text-sm text-purple-600 mt-0.5">Homes Covered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search residents..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        <select
          value={selectedHome}
          onChange={(e) => setSelectedHome(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
        >
          <option value="">All Homes</option>
          {homes.map((h) => (
            <option key={h._id} value={h._id}>{h.name}</option>
          ))}
        </select>
      </div>

      {/* Residents Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No residents found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((resident) => {
            const eligibleKeys = getEligibleSchemes(resident);
            const isExpanded = expandedResident === resident._id;
            return (
              <div key={resident._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div
                  className="flex items-center justify-between p-5 cursor-pointer"
                  onClick={() => setExpandedResident(isExpanded ? null : resident._id)}
                >
                  <div className="flex items-center gap-4">
                    {resident.photo ? (
                      <img src={resident.photo} alt="" className="w-11 h-11 rounded-xl object-cover border" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500 font-bold">{resident.name?.[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{resident.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                        <span className="capitalize">{resident.gender}</span>
                        <span>·</span>
                        <span>{resident.age} yrs</span>
                        {resident.disability && resident.disability !== 'none' && (
                          <>
                            <span>·</span>
                            <span className="text-orange-600">♿ {resident.disability}</span>
                          </>
                        )}
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          {resident.home?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5 flex-wrap justify-end max-w-[260px]">
                      {eligibleKeys.slice(0, 3).map((key) => {
                        const scheme = SCHEME_KEYS.find((s) => s.key === key);
                        const status = resident.governmentSchemes?.[key]?.status || 'eligible';
                        return (
                          <SchemeStatusBadge key={key} status={status} />
                        );
                      })}
                      {eligibleKeys.length > 3 && (
                        <span className="text-xs text-gray-400">+{eligibleKeys.length - 3} more</span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Scheme Eligibility & Status
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">Scheme</th>
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">Eligible?</th>
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">Status</th>
                            <th className="text-left py-2 text-xs font-semibold text-gray-500">Applied Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {SCHEME_KEYS.map((scheme) => {
                            const isEligible = eligibleKeys.includes(scheme.key);
                            const data = resident.governmentSchemes?.[scheme.key];
                            const status = isEligible ? (data?.status || 'eligible') : 'not_eligible';
                            const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.eligible;
                            const Ico = cfg.icon;
                            return (
                              <tr key={scheme.key} className="hover:bg-gray-50">
                                <td className="py-2.5 pr-4">
                                  <span className="font-medium">{scheme.icon} {scheme.label}</span>
                                </td>
                                <td className="py-2.5 pr-4">
                                  {isEligible ? (
                                    <span className="text-green-600 font-semibold text-xs">✅ Yes</span>
                                  ) : (
                                    <span className="text-gray-400 text-xs">— No</span>
                                  )}
                                </td>
                                <td className="py-2.5 pr-4">
                                  <span className={`flex items-center gap-1 text-xs font-semibold ${cfg.color}`}>
                                    <Ico className="w-3.5 h-3.5" />
                                    {cfg.label}
                                  </span>
                                </td>
                                <td className="py-2.5 text-xs text-gray-500">
                                  {data?.appliedDate
                                    ? new Date(data.appliedDate).toLocaleDateString('en-IN')
                                    : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Financial Info */}
                    {resident.financial && (
                      <div className="mt-4 bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Pension Amount', value: resident.financial.pensionAmount ? `₹${resident.financial.pensionAmount}/mo` : '—' },
                          { label: 'Pension Status', value: resident.financial.pensionStatus || '—' },
                          { label: 'Bank Account', value: resident.financial.bankAccount ? '✓ Linked' : 'Not Linked' },
                          { label: 'Last Received', value: resident.financial.lastReceivedDate ? new Date(resident.financial.lastReceivedDate).toLocaleDateString('en-IN') : '—' },
                        ].map((item) => (
                          <div key={item.label}>
                            <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                            <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
