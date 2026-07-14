import { useEffect, useState } from 'react';
import { Shield, BadgeCheck, FileText } from 'lucide-react';
import { getDonationTracker } from '../services/api';

export default function TransparencyPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDonationTracker()
      .then((res) => setDonations(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Transparency Center</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We believe in complete transparency. Track donations, verify home credentials, and see how funds are utilized.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: BadgeCheck, title: 'Verified Homes', desc: 'Every home is verified with registration certificates, PAN, and NGO documents before approval.' },
          { icon: FileText, title: 'Expense Reports', desc: 'Monthly expense breakdowns and donation utilization bills are publicly available.' },
          { icon: Shield, title: 'Audit Trail', desc: 'All updates and verifications are logged for complete accountability.' },
        ].map((item) => (
          <div key={item.title} className="card text-center">
            <item.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-6">Public Donation Tracker</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : donations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Donor</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Purpose</th>
                  <th className="pb-3 font-medium">Home</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Verified</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id} className="border-b last:border-0">
                    <td className="py-3">{d.donorName}</td>
                    <td className="py-3 font-medium text-primary-600">₹{d.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-3 capitalize">{d.purpose?.replace('_', ' ')}</td>
                    <td className="py-3">{d.home?.name || 'General Fund'}</td>
                    <td className="py-3 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">{d.isVerified ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No donations recorded yet.</p>
        )}
      </div>
    </div>
  );
}
