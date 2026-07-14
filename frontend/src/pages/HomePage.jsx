import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Shield, Users } from 'lucide-react';
import StatCard from '../components/StatCard';
import HomeCard from '../components/HomeCard';
import { getStats, getHomes } from '../services/api';

export default function HomePage() {
  const [stats, setStats] = useState({});
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getHomes()])
      .then(([statsRes, homesRes]) => {
        setStats(statsRes.data.data);
        setHomes(homesRes.data.data.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Connecting Care with Compassion
            </h1>
            <p className="text-lg text-primary-100 mb-8 leading-relaxed">
              SevaSethu bridges orphanages, old-age homes, donors, NGOs, and hospitals
              into one transparent platform — so every act of kindness reaches those who need it most.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/donate" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
                <Heart className="w-5 h-5" /> Donate Now
              </Link>
              <Link to="/homes" className="border border-white/30 hover:bg-white/10 font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
                Browse Homes <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {!loading && Object.entries(stats).map(([key, value]) => (
            <StatCard key={key} name={key} value={value} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why SevaSethu?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We bring transparency, accountability, and compassion together for social welfare.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Full Transparency', desc: 'Track every donation, view expense reports, and see verified utilization proofs.' },
            { icon: Users, title: 'Resident Welfare', desc: 'Complete health profiles, government scheme tracking, and daily care records.' },
            { icon: Heart, title: 'Easy Giving', desc: 'Donate via UPI QR, sponsor meals, medicines, or education — no login required.' },
          ].map((item) => (
            <div key={item.title} className="card text-center">
              <div className="inline-flex p-3 bg-primary-50 rounded-xl mb-4">
                <item.icon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Homes</h2>
            <Link to="/homes" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : homes.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {homes.map((home) => <HomeCard key={home._id} home={home} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No homes registered yet.</p>
              <Link to="/register-home" className="text-primary-600 mt-2 inline-block">Register your home →</Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Make a Difference Today</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Whether you donate, volunteer, or register your organization — every action creates lasting impact.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/donate" className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors">
              Donate
            </Link>
            <Link to="/volunteer" className="border border-white/40 font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Volunteer
            </Link>
            <Link to="/register-home" className="border border-white/40 font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Register Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
