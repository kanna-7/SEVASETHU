import { useState } from 'react';
import { HandHeart, CheckCircle } from 'lucide-react';
import { registerVolunteer } from '../services/api';

export default function VolunteerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', age: '', skills: '', availability: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerVolunteer({
        ...form,
        age: form.age ? Number(form.age) : undefined,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
        <p className="text-gray-600">We'll contact you when volunteer opportunities arise.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <HandHeart className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Volunteer With Us</h1>
        <p className="text-gray-600">Share your time and skills to make a difference in people's lives.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input required type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone *</label>
            <input required type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
          <input type="text" placeholder="Teaching, Cooking, Medical..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Availability</label>
          <textarea rows={3} placeholder="Weekends, weekdays, specific hours..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Register as Volunteer'}
        </button>
      </form>
    </div>
  );
}
