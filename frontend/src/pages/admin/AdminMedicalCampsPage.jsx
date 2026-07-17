import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Stethoscope, Plus, X, Calendar, MapPin, Home, CheckCircle,
  Clock, AlertCircle, ChevronDown, ChevronUp, Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getAllCampsAdmin, createMedicalCamp, getApprovedHomes, getMedicalCamps } from '../../services/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_ICONS = {
  pending: Clock,
  approved: CheckCircle,
  ongoing: AlertCircle,
  completed: CheckCircle,
  cancelled: X,
};

export default function AdminMedicalCampsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [camps, setCamps] = useState([]);
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedCamp, setExpandedCamp] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    locationAddress: '',
    locationCity: '',
    doctors: '',
    specializations: '',
    selectedHomes: [],
  });

  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        getAllCampsAdmin().catch(() => getMedicalCamps()),  // fallback if /all not deployed yet
        getApprovedHomes(),
      ])
        .then(([campsRes, homesRes]) => {
          setCamps(campsRes.data.data || []);
          setHomes(homesRes.data.data || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const toggleHomeSelection = (homeId) => {
    setForm((prev) => ({
      ...prev,
      selectedHomes: prev.selectedHomes.includes(homeId)
        ? prev.selectedHomes.filter((id) => id !== homeId)
        : [...prev.selectedHomes, homeId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.selectedHomes.length === 0) {
      alert('Please select at least one home.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        date: form.date,
        endDate: form.endDate || undefined,
        location: { address: form.locationAddress, city: form.locationCity },
        doctors: form.doctors ? form.doctors.split(',').map((d) => d.trim()) : [],
        specializations: form.specializations ? form.specializations.split(',').map((s) => s.trim()) : [],
        homes: JSON.stringify(form.selectedHomes),
      };
      const res = await createMedicalCamp(payload);
      setCamps((prev) => [res.data.data, ...prev]);
      setShowForm(false);
      setForm({
        title: '', description: '', date: '', endDate: '',
        locationAddress: '', locationCity: '', doctors: '',
        specializations: '', selectedHomes: [],
      });
      alert('✅ Medical camp created! Home managers have been notified.');
    } catch (err) {
      alert(err.response?.data?.message || `Failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/login" />;

  return (
    <DashboardLayout type="admin">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-blue-600" />
            Medical Camps
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Schedule medical camps for homes — managers will be notified automatically
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow"
        >
          <Plus className="w-4 h-4" />
          Schedule New Camp
        </button>
      </div>

      {/* Create Camp Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Schedule Medical Camp
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Camp Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., General Health Checkup Camp"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="What services will be provided..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location / Address
                  </label>
                  <input
                    value={form.locationAddress}
                    onChange={(e) => setForm({ ...form, locationAddress: e.target.value })}
                    placeholder="Address or venue"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                  <input
                    value={form.locationCity}
                    onChange={(e) => setForm({ ...form, locationCity: e.target.value })}
                    placeholder="City"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Doctors (comma-separated)</label>
                  <input
                    value={form.doctors}
                    onChange={(e) => setForm({ ...form, doctors: e.target.value })}
                    placeholder="Dr. Sharma, Dr. Rao"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Specializations (comma-separated)</label>
                  <input
                    value={form.specializations}
                    onChange={(e) => setForm({ ...form, specializations: e.target.value })}
                    placeholder="General, Cardiology"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Home Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Select Homes * ({form.selectedHomes.length} selected)
                </label>
                <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-100">
                  {homes.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">No approved homes found</p>
                  ) : (
                    homes.map((home) => (
                      <label
                        key={home._id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          form.selectedHomes.includes(home._id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.selectedHomes.includes(home._id)}
                          onChange={() => toggleHomeSelection(home._id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{home.name}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {home.type?.replace('_', ' ')} · {home.address?.city}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? 'Scheduling...' : '🏥 Schedule & Notify Homes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Camps', value: camps.length, color: 'blue' },
          { label: 'Completed', value: camps.filter(c => c.status === 'completed').length, color: 'green' },
          { label: 'Upcoming', value: camps.filter(c => ['approved', 'pending'].includes(c.status)).length, color: 'yellow' },
          { label: 'Homes Covered', value: [...new Set(camps.flatMap(c => (c.homes || []).map(h => h._id || h)))].length, color: 'purple' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-xl p-4`}>
            <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
            <p className={`text-sm text-${stat.color}-600 mt-0.5`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Camps List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : camps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Stethoscope className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Medical Camps Yet</h3>
          <p className="text-gray-500 mb-6">Schedule your first camp to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Schedule Camp
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {camps.map((camp) => {
            const StatusIcon = STATUS_ICONS[camp.status] || Clock;
            const isExpanded = expandedCamp === camp._id;
            return (
              <div
                key={camp._id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="flex items-start justify-between p-5 cursor-pointer"
                  onClick={() => setExpandedCamp(isExpanded ? null : camp._id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-lg">{camp.title}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[camp.status]}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {camp.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(camp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {camp.location?.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {camp.location.address}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        {(camp.homes || []).length} home(s)
                      </span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 mt-1" /> : <ChevronDown className="w-5 h-5 text-gray-400 mt-1" />}
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
                    {camp.description && (
                      <p className="text-sm text-gray-600">{camp.description}</p>
                    )}

                    {/* Homes List */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assigned Homes</p>
                      <div className="flex flex-wrap gap-2">
                        {(camp.homes || []).map((home) => (
                          <span key={home._id || home} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                            {home.name || 'Unknown'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Doctors */}
                    {camp.doctors?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Doctors</p>
                        <div className="flex flex-wrap gap-2">
                          {camp.doctors.map((d, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Completion Images */}
                    {camp.completionImages?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Completion Photos</p>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                          {camp.completionImages.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`Camp photo ${i + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {camp.completionNotes && (
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-green-700 mb-1">Completion Notes</p>
                        <p className="text-sm text-green-800">{camp.completionNotes}</p>
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
