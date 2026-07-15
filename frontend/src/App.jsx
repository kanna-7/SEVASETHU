import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import HomesPage from './pages/HomesPage';
import HomeDetailPage from './pages/HomeDetailPage';
import DonatePage from './pages/DonatePage';
import VolunteerPage from './pages/VolunteerPage';
import RegisterHomePage from './pages/RegisterHomePage';
import TransparencyPage from './pages/TransparencyPage';
import LoginPage from './pages/LoginPage';
import GuardianApplicationPage from './pages/GuardianApplicationPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHomesPage from './pages/admin/AdminHomesPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerResidentsPage from './pages/manager/ManagerResidentsPage';
import ManagerSettingsPage from './pages/manager/ManagerSettingsPage';
import ManagerInventoryPage from './pages/manager/ManagerInventoryPage';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/homes" element={<PublicLayout><HomesPage /></PublicLayout>} />
      <Route path="/homes/:slug" element={<PublicLayout><HomeDetailPage /></PublicLayout>} />
      <Route path="/donate" element={<PublicLayout><DonatePage /></PublicLayout>} />
      <Route path="/volunteer" element={<PublicLayout><VolunteerPage /></PublicLayout>} />
      <Route path="/register-home" element={<PublicLayout><RegisterHomePage /></PublicLayout>} />
      <Route path="/transparency" element={<PublicLayout><TransparencyPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/guardian/apply" element={<PublicLayout><GuardianApplicationPage /></PublicLayout>} />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/homes" element={<AdminHomesPage />} />

      <Route path="/manager" element={<ManagerDashboard />} />
      <Route path="/manager/residents" element={<ManagerResidentsPage />} />
      <Route path="/manager/settings" element={<ManagerSettingsPage />} />
      <Route path="/manager/inventory" element={<ManagerInventoryPage />} />
    </Routes>
  );
}
