import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Building2, MapPin, Phone, Mail, Users, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getPendingHomes, approveHome, getApprovedHomes } from '../../services/api';

export default function AdminHomesPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [homes, setHomes] = useState([]); // Pending requests
  const [acceptedHomes, setAcceptedHomes] = useState([]); // Approved homes
  const [loading, setLoading] = useState(true);
  const [approval, setApproval] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'accepted'

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      Promise.all([getPendingHomes(), getApprovedHomes()])
        .then(([pendingRes, acceptedRes]) => {
          setHomes(pendingRes.data.data);
          setAcceptedHomes(acceptedRes.data.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const handleApprove = async (id, approved) => {
    try {
      const res = await approveHome(id, { approved });
      // Remove from pending list
      const approvedHome = homes.find((h) => h._id === id);
      setHomes(homes.filter((h) => h._id !== id));
      
      if (approved) {
        setApproval(res.data.data);
        // Add to accepted list
        if (res.data.data.home) {
          setAcceptedHomes((current) => [res.data.data.home, ...current]);
        } else if (approvedHome) {
          // Fallback if backend doesn't return full home details in res.data.data.home
          setAcceptedHomes((current) => [{ ...approvedHome, status: 'approved', isVerified: true }, ...current]);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/login" />;

  return (
    <DashboardLayout type="admin">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Home Registrations</h2>
          <p className="text-sm text-gray-500">Manage pending registration requests and view approved homes</p>
        </div>
      </div>

      {approval && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Approval completed — send these access details to the Home Guardian.</p>
            <p className="mt-1">
              Email: <strong>{approval.manager?.email}</strong>
              {approval.temporaryPassword && (
                <> · Temporary password: <strong>{approval.temporaryPassword}</strong></>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors relative ${
            activeTab === 'pending'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Requests
          {homes.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
              {homes.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('accepted')}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors relative ${
            activeTab === 'accepted'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Approved Homes
          {acceptedHomes.length > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
              {acceptedHomes.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 py-6">Loading...</p>
      ) : activeTab === 'pending' ? (
        homes.length > 0 ? (
          <div className="space-y-4">
            {homes.map((home) => {
              const homeImage = home.images?.gallery?.[0] || home.images?.building?.[0];
              return (
                <div key={home._id} className="card hover:shadow-sm transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Column */}
                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center border border-gray-100">
                      {homeImage ? (
                        <img src={homeImage} alt={home.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <Building2 className="w-8 h-8 mb-1" />
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">{home.name}</h3>
                          <span className="badge bg-yellow-100 text-yellow-800 capitalize text-xs">
                            {home.type?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                          <MapPin className="w-3.5 h-3.5" /> {home.address?.city}, {home.address?.state}
                        </p>
                        
                        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
                          <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {home.phone}</p>
                          <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {home.email}</p>
                          {home.contactPerson?.name && (
                            <p className="flex items-center gap-1.5 sm:col-span-2">
                              <Users className="w-3.5 h-3.5 text-gray-400" /> 
                              Manager: <strong>{home.contactPerson.name}</strong> ({home.contactPerson.phone || 'No phone'})
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 md:mt-0 justify-end">
                        <button
                          onClick={() => handleApprove(home._id, true)}
                          className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleApprove(home._id, false)}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-12 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-600">No pending registrations</p>
            <p className="text-sm mt-1">All application requests have been processed.</p>
          </div>
        )
      ) : acceptedHomes.length > 0 ? (
        <div className="space-y-4">
          {acceptedHomes.map((home) => {
            const homeImage = home.images?.gallery?.[0] || home.images?.building?.[0];
            return (
              <div key={home._id} className="card hover:shadow-sm transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Column */}
                  <Link to={`/homes/${home.slug}`} className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center border border-gray-100 hover:opacity-90 transition-opacity">
                    {homeImage ? (
                      <img src={homeImage} alt={home.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Building2 className="w-8 h-8 mb-1" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </Link>

                  {/* Details Column */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          <Link to={`/homes/${home.slug}`} className="hover:text-primary-600 transition-colors">
                            {home.name}
                          </Link>
                        </h3>
                        <span className="badge bg-green-100 text-green-800 capitalize text-xs">
                          {home.type?.replace('_', ' ')}
                        </span>
                        <span className="badge badge-verified text-xs flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3 text-primary-600" /> Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin className="w-3.5 h-3.5" /> {home.address?.city}, {home.address?.state}
                      </p>
                      
                      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
                        <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {home.phone}</p>
                        <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {home.email}</p>
                        {home.residentCount !== undefined && (
                          <p className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" /> {home.residentCount} Residents</p>
                        )}
                        {home.contactPerson?.name && (
                          <p className="flex items-center gap-1.5 sm:col-span-2">
                            Manager: <strong>{home.contactPerson.name}</strong>
                          </p>
                        )}
                      </div>

                      {/* Guardian Login Details */}
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs max-w-md">
                        <p className="font-semibold text-gray-700 mb-1">Guardian Login Details:</p>
                        <p className="text-gray-600">Email: <strong className="text-gray-900">{home.manager?.email || home.email}</strong></p>
                        <p className="text-gray-600 mt-0.5">Password: <strong className="text-gray-900">{home.temporaryPassword || 'ChangeMe@123'}</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-600">No approved homes</p>
          <p className="text-sm mt-1">Once you approve registration requests, they will appear here.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
