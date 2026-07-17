import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FileText, Search, Users, CheckCircle, Clock, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getResidents, updateResidentScheme } from '../../services/api';

const SCHEME_KEYS = [
  { key: 'oldAgePension', label: 'Old Age Pension', icon: '💰', eligibleAge: 60 },
  { key: 'widowPension', label: 'Widow Pension', icon: '💳' },
  { key: 'disabilityPension', label: 'Disability Pension', icon: '♿' },
  { key: 'ayushmanBharat', label: 'Ayushman Bharat', icon: '🏥' },
  { key: 'rationCard', label: 'Ration Card', icon: '🌾' },
  { key: 'arogyasri', label: 'Arogyasri', icon: '🩺' },
  { key: 'foodSecurityCard', label: 'Food Security Card', icon: '🃏' },
];

const STATUS_OPTIONS = ['eligible', 'applied', 'approved', 'rejected'];

const STATUS_CONFIG = {
  eligible: { label: 'Eligible', icon: CheckCircle, badge: 'bg-green-100 text-green-700' },
  applied: { label: 'Applied', icon: Clock, badge: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved ✓', icon: CheckCircle, badge: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', icon: XCircle, badge: 'bg-red-100 text-red-700' },
};

function getEligibleSchemes(resident) {
  const eligible = [];
  const age = resident.age || 0;
  const gender = resident.gender;
  const hasDisability = !!resident.disability && resident.disability !== 'none';

  if (age >= 60) eligible.push('oldAgePension');
  if (gender === 'female') eligible.push('widowPension');
  if (hasDisability) eligible.push('disabilityPension');
  eligible.push('ayushmanBharat', 'rationCard', 'arogyasri', 'foodSecurityCard');

  return [...new Set(eligible)];
}

export default function ManagerReportsPage() {
  const { isManager, loading: authLoading } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedResident, setExpandedResident] = useState(null);
  const [updatingScheme, setUpdatingScheme] = useState(null);

  useEffect(() => {
    if (isManager) {
      getResidents()
        .then((res) => setResidents(res.data.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isManager]);

  const filtered = residents.filter((r) =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSchemeUpdate = async (residentId, schemeKey, status) => {
    setUpdatingScheme(`${residentId}-${schemeKey}`);
    try {
      await updateResidentScheme(residentId, { scheme: schemeKey, status });
      setResidents((prev) =>
        prev.map((r) =>
          r._id === residentId
            ? {
                ...r,
                governmentSchemes: {
                  ...r.governmentSchemes,
                  [schemeKey]: { ...(r.governmentSchemes?.[schemeKey] || {}), status },
                },
              }
            : r
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update scheme status');
    } finally {
      setUpdatingScheme(null);
    }
  };

  // Summary
  const approvedCount = residents.reduce(
    (acc, r) => acc + Object.values(r.governmentSchemes || {}).filter((s) => s?.status === 'approved').length,
    0
  );
  const appliedCount = residents.reduce(
    (acc, r) => acc + Object.values(r.governmentSchemes || {}).filter((s) => s?.status === 'applied').length,
    0
  );

  if (authLoading) return null;
  if (!isManager) return <Navigate to="/login" />;

  return (
    <DashboardLayout type="manager">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary-600" />
          Scheme Reports
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track and update government scheme eligibility for your residents
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-700">{residents.length}</p>
          <p className="text-sm text-blue-600 mt-0.5">Total Residents</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
          <p className="text-sm text-green-600 mt-0.5">Schemes Approved</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-700">{appliedCount}</p>
          <p className="text-sm text-blue-600 mt-0.5">Applied / In Progress</p>
        </div>
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
          <a
            href="/schemes"
            target="_blank"
            className="flex items-center gap-1 text-primary-700 font-bold text-sm hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View All Schemes
          </a>
          <p className="text-xs text-primary-600 mt-1">Official portals & YouTube guides</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search residents..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
      </div>

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
            const approvedForResident = Object.values(resident.governmentSchemes || {}).filter(
              (s) => s?.status === 'approved'
            ).length;

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
                      <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                        <span className="text-primary-700 font-bold">{resident.name?.[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{resident.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <span className="capitalize">{resident.gender}</span>
                        <span>·</span>
                        <span>{resident.age} yrs</span>
                        {resident.disability && resident.disability !== 'none' && (
                          <>
                            <span>·</span>
                            <span className="text-orange-600">♿ Disability</span>
                          </>
                        )}
                        <span>·</span>
                        <span className="text-green-700 font-semibold">{approvedForResident} scheme(s) approved</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{eligibleKeys.length} eligible</span>
                    <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      Scheme Status — Update as needed
                    </p>
                    <div className="space-y-3">
                      {SCHEME_KEYS.map((scheme) => {
                        const isEligible = eligibleKeys.includes(scheme.key);
                        const data = resident.governmentSchemes?.[scheme.key];
                        const status = isEligible ? (data?.status || 'eligible') : null;
                        const cfg = status ? STATUS_CONFIG[status] : null;
                        const isUpdating = updatingScheme === `${resident._id}-${scheme.key}`;

                        if (!isEligible) return null;

                        return (
                          <div key={scheme.key} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{scheme.icon}</span>
                              <span className="text-sm font-medium text-gray-800">{scheme.label}</span>
                              {cfg && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
                                  {cfg.label}
                                </span>
                              )}
                            </div>
                            <select
                              disabled={isUpdating}
                              value={status || 'eligible'}
                              onChange={(e) => handleSchemeUpdate(resident._id, scheme.key, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:opacity-60"
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>

                    {/* Financial quick view */}
                    {(resident.financial?.pensionAmount || resident.financial?.pensionStatus) && (
                      <div className="mt-4 bg-green-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Financial Details</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {resident.financial.pensionAmount && (
                            <div>
                              <p className="text-xs text-green-600">Monthly Pension</p>
                              <p className="font-bold text-green-900">₹{resident.financial.pensionAmount}</p>
                            </div>
                          )}
                          {resident.financial.pensionStatus && (
                            <div>
                              <p className="text-xs text-green-600">Pension Status</p>
                              <p className="font-bold text-green-900">{resident.financial.pensionStatus}</p>
                            </div>
                          )}
                        </div>
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
