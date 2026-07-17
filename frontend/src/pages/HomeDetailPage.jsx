import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Users, BadgeCheck, QrCode, Heart, User, Calendar, Stethoscope, CheckCircle, ImageIcon } from 'lucide-react';
import { getHome, getPublicEvents } from '../services/api';

const tabs = ['About', 'Residents', 'Gallery', 'Needs', 'Donations', 'Events', 'Reviews'];

export default function HomeDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('About');
  const [loading, setLoading] = useState(true);
  const [publicEvents, setPublicEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    getHome(slug)
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  // Load public completed events when Events tab is active
  useEffect(() => {
    if (activeTab === 'Events' && slug) {
      setEventsLoading(true);
      getPublicEvents(slug)
        .then((res) => setPublicEvents(res.data.data || []))
        .catch(console.error)
        .finally(() => setEventsLoading(false));
    }
  }, [activeTab, slug]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>;
  if (!data) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Home not found</div>;

  const { home, recentDonations, events, residents = [] } = data;
  const gallery = [
    ...(home.images?.building || []),
    ...(home.images?.kitchen || []),
    ...(home.images?.rooms || []),
    ...(home.images?.gallery || []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
            {gallery[0] ? (
              <img 
                src={gallery[0]} 
                alt={home.name} 
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop';
                }}
                className="w-full h-full object-cover" 
              />
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop" 
                alt="Default Home" 
                className="w-full h-full object-cover" 
              />
            )}
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">{home.name}</h1>
                {home.isVerified && (
                  <span className="badge badge-verified"><BadgeCheck className="w-3 h-3 mr-1" /> Verified</span>
                )}
              </div>
              <p className="text-gray-500 capitalize">{home.type?.replace('_', ' ')}</p>
            </div>
            <span className={`badge badge-${home.conditionStatus}`}>
              {home.conditionStatus?.replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{home.address?.city}, {home.address?.state}</span>
             <button 
              onClick={() => setActiveTab('Residents')} 
              className="flex items-center gap-1 hover:text-primary-600 transition-colors"
            >
              <Users className="w-4 h-4" />
              {home.residentCount} residents
            </button>
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{home.phone}</span>
            <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{home.email}</span>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'About' && (
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">{home.description || 'No description available.'}</p>
              {home.contactPerson && (
                <div className="mt-6 card">
                  <h3 className="font-semibold mb-2">Contact Person</h3>
                  <p className="text-sm text-gray-600">{home.contactPerson.name} — {home.contactPerson.designation}</p>
                  <p className="text-sm text-gray-600">{home.contactPerson.phone}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Gallery' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.length > 0 ? gallery.map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  alt="" 
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop';
                  }}
                  className="aspect-square object-cover rounded-lg" 
                />
              )) : <p className="text-gray-500 col-span-3">No images uploaded yet.</p>}
            </div>
          )}

          {activeTab === 'Residents' && (() => {
            const activeResidents = residents.filter((r) => r.status !== 'expired');
            const expiredResidents = residents.filter((r) => r.status === 'expired');
            return (
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-gray-900 flex items-center gap-2">
                    <span>Current Residents</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-normal">
                      {activeResidents.length} active
                    </span>
                  </h3>
                  {activeResidents.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {activeResidents.map((r, i) => (
                        <div key={i} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center">
                            {r.photo ? (
                              <img
                                src={r.photo}
                                alt={r.name}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop';
                                }}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{r.name}</h4>
                            <p className="text-sm text-gray-500 capitalize">{r.gender} · {r.age} yrs</p>
                            {r.bloodGroup && <span className="text-xs font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full mt-1 inline-block">{r.bloodGroup} Blood Group</span>}
                            {r.disability && <p className="text-xs text-amber-700 mt-0.5">Disability: {r.disability}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No active residents details listed publicly.</p>
                  )}
                </div>

                {expiredResidents.length > 0 && (
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-lg mb-4 text-gray-500 flex items-center gap-2">
                      <span>In Loving Memory</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                        {expiredResidents.length} passed away
                      </span>
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {expiredResidents.map((r, i) => (
                        <div key={i} className="card bg-gray-50/50 border-gray-100 flex items-center gap-4 filter grayscale opacity-75 hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center relative">
                            {r.photo ? (
                              <img
                                src={r.photo}
                                alt={r.name}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop';
                                }}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-gray-400" />
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white text-center py-0.5 font-medium">Memory</div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 flex items-center gap-1.5">
                              <span>{r.name}</span>
                              <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.2 rounded-full font-medium">RIP</span>
                            </h4>
                            <p className="text-sm text-gray-500 capitalize">{r.gender} · {r.age} yrs</p>
                            <p className="text-xs text-gray-400 mt-1 italic">Forever in our hearts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'Needs' && (
            <div className="space-y-3">
              {home.currentNeeds?.filter((need) => need.status === 'approved' || !need.status).length > 0 ? (
                home.currentNeeds.filter((need) => need.status === 'approved' || !need.status).map((need, i) => (
                  <div key={i} className="card flex justify-between items-center">
                    <span className="font-medium">{need.item}</span>
                    <span className="text-sm text-gray-500">Qty: {need.quantity} · {need.priority} priority</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No current needs listed.</p>
              )}
            </div>
          )}

          {activeTab === 'Donations' && (
            <div className="space-y-3">
              {recentDonations?.length > 0 ? recentDonations.map((d) => (
                <div key={d._id} className="card flex justify-between">
                  <span>{d.isAnonymous ? 'Anonymous' : d.donorName}</span>
                  <span className="font-medium text-primary-600">₹{d.amount?.toLocaleString('en-IN')}</span>
                </div>
              )) : <p className="text-gray-500">No donations yet.</p>}
            </div>
          )}

          {activeTab === 'Events' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Completed Events</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Medical camps and activities carried out at this home</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                  {publicEvents.length} event{publicEvents.length !== 1 ? 's' : ''}
                </span>
              </div>

              {eventsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="card animate-pulse h-32" />
                  ))}
                </div>
              ) : publicEvents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No completed events yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Events will appear here after they are completed by the home manager.</p>
                </div>
              ) : (
                publicEvents.map((ev) => (
                  <div key={ev._id} className="card border border-gray-200 hover:shadow-md transition-shadow overflow-hidden p-0">
                    {/* Event header */}
                    <div className="flex items-start gap-4 p-5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        {ev.type === 'medical_camp'
                          ? <Stethoscope className="w-5 h-5 text-blue-600" />
                          : <Calendar className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900">{ev.title}</h4>
                          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        </div>
                        {ev.description && (
                          <p className="text-sm text-gray-500 mt-1">{ev.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {ev.location && <span>📍 {ev.location}</span>}
                          {ev.completedAt && (
                            <span>✅ Completed: {new Date(ev.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Completion Notes */}
                    {ev.completionNotes && (
                      <div className="mx-5 mb-4 bg-blue-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Event Notes</p>
                        <p className="text-sm text-blue-800">{ev.completionNotes}</p>
                      </div>
                    )}

                    {/* Photo Gallery */}
                    {(() => {
                      const photos = [...(ev.completionImages || []), ...(ev.images || [])].filter(Boolean);
                      const unique = [...new Set(photos)];
                      return unique.length > 0 ? (
                        <div className="px-5 pb-5">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" /> {unique.length} Photo{unique.length !== 1 ? 's' : ''}
                          </p>
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {unique.map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt={`${ev.title} photo ${i + 1}`}
                                className="w-full h-28 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="space-y-3">
              {home.reviews?.length > 0 ? home.reviews.map((r, i) => (
                <div key={i} className="card">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{r.donorName}</span>
                    <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{r.comment}</p>
                </div>
              )) : <p className="text-gray-500">No reviews yet.</p>}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {home.contactPerson && (
            <div className="card text-center">
              <h3 className="font-semibold text-lg mb-4 text-left border-b border-gray-100 pb-2">Home Guardian</h3>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-50 border border-gray-200 mb-3 shrink-0 flex items-center justify-center">
                  {home.contactPerson.photo ? (
                    <img 
                      src={home.contactPerson.photo} 
                      alt={home.contactPerson.name} 
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-gray-400 font-bold text-2xl uppercase">
                      {home.contactPerson.name?.charAt(0) || 'G'}
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">{home.contactPerson.name}</h4>
                <p className="text-xs text-gray-500 capitalize">{home.contactPerson.designation || 'Guardian / Manager'}</p>
                
                <div className="w-full border-t border-gray-100 mt-4 pt-3 text-left space-y-2 text-xs text-gray-600">
                  {home.contactPerson.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {home.contactPerson.phone}
                    </p>
                  )}
                  {home.contactPerson.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" /> {home.contactPerson.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold text-lg mb-4">Donate to this Home</h3>
            {home.qrCode && (
              <div className="bg-gray-50 rounded-lg p-4 text-center mb-4">
                <QrCode className="w-32 h-32 mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Scan QR to donate via UPI</p>
              </div>
            )}
            <Link to={`/donate?home=${home._id}`} className="btn-primary w-full flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" /> Donate Now
            </Link>
          </div>

          {home.monthlyExpenses?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-3">Monthly Expenses</h3>
              {home.monthlyExpenses.slice(-3).map((exp, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b last:border-0">
                  <span>{exp.month} {exp.year}</span>
                  <span className="font-medium">₹{exp.amount?.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold mb-3">Location</h3>
            {home.googleMapsUrl ? (
              <a
                href={home.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-blue-100 transition-colors text-blue-700 text-sm font-medium gap-2"
              >
                <MapPin className="w-8 h-8 text-blue-500" />
                <span>Open in Google Maps</span>
              </a>
            ) : (
              <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center text-gray-400 text-sm">
                Google Maps integration
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
