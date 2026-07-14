import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
              <Heart className="w-5 h-5 fill-primary-500 text-primary-500" />
              SevaSethu
            </div>
            <p className="text-sm text-gray-400">
              Connecting Care with Compassion. Building transparency and trust in social welfare.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/homes" className="hover:text-white">Browse Homes</Link></li>
              <li><Link to="/donate" className="hover:text-white">Donate</Link></li>
              <li><Link to="/volunteer" className="hover:text-white">Volunteer</Link></li>
              <li><Link to="/transparency" className="hover:text-white">Transparency</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">For Organizations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register-home" className="hover:text-white">Register Your Home</Link></li>
              <li><Link to="/login" className="hover:text-white">Manager Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <p className="text-sm text-gray-400">support@sevasethu.org</p>
            <p className="text-sm text-gray-400 mt-1">+91 98765 43210</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SevaSethu. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
