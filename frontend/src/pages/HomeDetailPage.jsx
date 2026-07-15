import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Users, BadgeCheck, QrCode, Heart } from 'lucide-react';
import { getHome } from '../services/api';

const tabs = ['About', 'Gallery', 'Needs', 'Donations', 'Events', 'Reviews'];

export default function HomeDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('About');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHome(slug)
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>;
  if (!data) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Home not found</div>;

  const { home, recentDonations, events } = data;
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
              <img src={gallery[0]} alt={home.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No image available</div>
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
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{home.residentCount} residents</span>
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
                <img key={i} src={img} alt="" className="aspect-square object-cover rounded-lg" />
              )) : <p className="text-gray-500 col-span-3">No images uploaded yet.</p>}
            </div>
          )}

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
            <div className="space-y-3">
              {events?.length > 0 ? events.map((e) => (
                <div key={e._id} className="card">
                  <h4 className="font-medium">{e.title}</h4>
                  <p className="text-sm text-gray-500">{new Date(e.date).toLocaleDateString()} · {e.type?.replace('_', ' ')}</p>
                </div>
              )) : <p className="text-gray-500">No events listed.</p>}
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
                    <img src={home.contactPerson.photo} alt={home.contactPerson.name} className="w-full h-full object-cover" />
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
