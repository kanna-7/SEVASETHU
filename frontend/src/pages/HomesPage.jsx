import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import HomeCard from '../components/HomeCard';
import { getHomes } from '../services/api';

export default function HomesPage() {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', city: '', condition: '', search: '' });

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    getHomes(params)
      .then((res) => setHomes(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Homes</h1>
        <p className="text-gray-600">Explore orphanages and old-age homes across India</p>
      </div>

      <div className="card mb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or city..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="orphanage">Orphanage</option>
            <option value="old_age_home">Old Age Home</option>
          </select>
          <input
            type="text"
            placeholder="City"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={filters.condition}
            onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
          >
            <option value="">All Conditions</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="needs_support">Needs Support</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : homes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homes.map((home) => <HomeCard key={home._id} home={home} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No homes found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
