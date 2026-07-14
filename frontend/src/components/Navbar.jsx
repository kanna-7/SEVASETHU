import { Link } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/homes', label: 'Homes' },
  { to: '/donate', label: 'Donate' },
  { to: '/volunteer', label: 'Volunteer' },
  { to: '/register-home', label: 'Register Home' },
  { to: '/transparency', label: 'Transparency' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAdmin, isManager } = useAuth();

  const dashboardLink = isAdmin ? '/admin' : isManager ? '/manager' : null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-primary-700 font-bold text-xl">
              <Heart className="w-7 h-7 fill-primary-600 text-primary-600" />
              SevaSethu
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {dashboardLink && (
              <Link to={dashboardLink} className="text-primary-600 font-medium text-sm">
                Dashboard
              </Link>
            )}
            {user ? (
              <button onClick={logout} className="btn-secondary text-sm">Logout</button>
            ) : (
              <Link to="/login" className="btn-primary text-sm">Login</Link>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block py-2 text-gray-600 hover:text-primary-600"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {dashboardLink && (
            <Link to={dashboardLink} className="block py-2 text-primary-600" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          )}
          {user ? (
            <button onClick={() => { logout(); setOpen(false); }} className="block py-2 text-red-600">Logout</button>
          ) : (
            <Link to="/login" className="block py-2 text-primary-600" onClick={() => setOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
