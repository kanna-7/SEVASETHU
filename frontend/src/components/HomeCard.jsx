import { Link } from 'react-router-dom';
import { MapPin, Users, BadgeCheck, QrCode } from 'lucide-react';

const conditionColors = {
  excellent: 'badge-excellent',
  good: 'badge-good',
  needs_support: 'badge-needs_support',
  critical: 'badge-critical',
};

const conditionLabels = {
  excellent: 'Excellent',
  good: 'Good',
  needs_support: 'Needs Support',
  critical: 'Critical',
};

export default function HomeCard({ home }) {
  const image = home.images?.gallery?.[0] || home.images?.building?.[0];

  return (
    <Link to={`/homes/${home.slug}`} className="card hover:shadow-md transition-shadow group">
      <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
        {image ? (
          <img src={image} alt={home.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{home.name}</h3>
        {home.isVerified && (
          <span className="badge badge-verified flex-shrink-0">
            <BadgeCheck className="w-3 h-3 mr-1" /> Verified
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
        <MapPin className="w-4 h-4" />
        {home.address?.city}, {home.address?.state}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          {home.residentCount} residents
        </div>
        <span className={`badge ${conditionColors[home.conditionStatus]}`}>
          {conditionLabels[home.conditionStatus]}
        </span>
      </div>

      {home.currentNeeds?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Current Needs:</p>
          <div className="flex flex-wrap gap-1">
            {home.currentNeeds.slice(0, 3).map((need, i) => (
              <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                {need.item}
              </span>
            ))}
          </div>
        </div>
      )}

      {home.qrCode && (
        <div className="mt-3 flex items-center gap-1 text-xs text-primary-600">
          <QrCode className="w-3 h-3" /> QR Donation Available
        </div>
      )}
    </Link>
  );
}
