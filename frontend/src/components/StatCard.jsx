import { Home, Users, IndianRupee, Stethoscope, HandHeart } from 'lucide-react';

const icons = {
  totalHomes: Home,
  totalResidents: Users,
  totalDonationAmount: IndianRupee,
  medicalCampsConducted: Stethoscope,
  activeVolunteers: HandHeart,
};

const labels = {
  totalHomes: 'Total Homes',
  totalResidents: 'Total Residents',
  totalDonationAmount: 'Total Donations',
  medicalCampsConducted: 'Medical Camps',
  activeVolunteers: 'Active Volunteers',
};

export default function StatCard({ name, value }) {
  const Icon = icons[name] || Home;
  const label = labels[name] || name;

  const formatted = name === 'totalDonationAmount'
    ? `₹${(value || 0).toLocaleString('en-IN')}`
    : (value || 0).toLocaleString('en-IN');

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className="p-2 bg-primary-50 rounded-lg">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{formatted}</p>
    </div>
  );
}
