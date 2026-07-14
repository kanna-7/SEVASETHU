import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Landmark, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const portals = [
  { title: 'Platform Admin', text: 'Verify homes, approve requests, and oversee the platform.', icon: ShieldCheck, to: '/login?portal=admin' },
  { title: 'Home Guardian', text: 'Register your home, then manage approved resident records.', icon: Building2, to: '/guardian/apply' },
  { title: 'Government Admin', text: 'Access verified welfare and scheme information.', icon: Landmark, to: '/login?portal=government' },
];

export default function LoginPage() {
  const [params] = useSearchParams();
  const portal = params.get('portal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const title = portal === 'government' ? 'Government Admin Login' : 'Platform Admin Login';

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'home_manager' ? '/manager' : '/admin');
    } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  if (!portal) return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-10"><h1 className="text-3xl font-bold">Choose your portal</h1><p className="text-gray-500 mt-2">A clear path for every SevaSethu partner.</p></div>
      <div className="grid md:grid-cols-3 gap-5">{portals.map(({ title, text, icon: Icon, to }) => (
        <Link key={title} to={to} className="card group hover:border-primary-300 hover:shadow-md transition-all">
          <Icon className="w-10 h-10 text-primary-600 mb-5" /><h2 className="font-bold text-xl">{title}</h2><p className="text-sm text-gray-500 mt-2 min-h-12">{text}</p>
          <span className="text-primary-700 text-sm font-semibold mt-5 flex items-center gap-1">Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
        </Link>
      ))}</div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-16"><div className="card">
      <Link to="/login" className="text-sm text-primary-700">← All portals</Link>
      <h1 className="text-2xl font-bold text-center mt-4">{title}</h1><p className="text-gray-500 text-center text-sm mt-2 mb-6">Use your approved SevaSethu account.</p>
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required type="email" placeholder="Email address" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" placeholder="Password" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-50">{loading ? 'Logging in...' : 'Login'}</button>
      </form>
    </div></div>
  );
}
