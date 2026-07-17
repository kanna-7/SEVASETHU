import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Calendar, Bell, CheckCircle, Clock, Upload, X,
  Stethoscope, Image as ImageIcon, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  getEvents,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  completeMedicalCamp,
} from '../../services/api';

const TYPE_ICONS = {
  medical_camp: Stethoscope,
  food_donation: '🍱',
  festival: '🎉',
  birthday: '🎂',
  government_visit: '🏛️',
  ngo_visit: '🤝',
  volunteer: '🙋',
  other: Calendar,
};

const STATUS_STYLES = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' },
  ongoing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-100 text-green-800' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
};

export default function ManagerEventsPage() {
  const { isManager, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingEvent, setCompletingEvent] = useState(null);
  const [completeForm, setCompleteForm] = useState({ notes: '', images: [] });
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (isManager) {
      setLoading(true);
      Promise.all([getEvents(), getNotifications()])
        .then(([evRes, notifRes]) => {
          setEvents(evRes.data.data || []);
          setNotifications(notifRes.data.data || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isManager]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setCompleteForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (idx) => {
    setCompleteForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const openCompleteModal = (event) => {
    setCompletingEvent(event);
    setCompleteForm({ notes: '', images: [] });
    setPreviews([]);
    setShowCompleteModal(true);
    setSelectedEvent(null);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!completingEvent?.medicalCamp) {
      alert('This event has no linked medical camp.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('completionNotes', completeForm.notes);
      completeForm.images.forEach((file) => fd.append('completionImages', file));

      await completeMedicalCamp(completingEvent.medicalCamp, fd);

      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === completingEvent._id ? { ...ev, status: 'completed' } : ev
        )
      );
      setShowCompleteModal(false);
      setCompletingEvent(null);
      alert('✅ Event marked as completed! Photos uploaded to public view.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete event');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;
  if (!isManager) return <Navigate to="/login" />;

  return (
    <DashboardLayout type="manager">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-primary-600" />
          Events & Notifications
        </h2>
        <p className="text-sm text-gray-500 mt-1">View upcoming events and manage completions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'events'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
            activeTab === 'notifications'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : activeTab === 'notifications' ? (
        /* NOTIFICATIONS TAB */
        <div>
          {unreadCount > 0 && (
            <div className="flex justify-end mb-3">
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleMarkRead(notif._id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    notif.isRead
                      ? 'bg-white border-gray-200 opacity-70'
                      : 'bg-blue-50 border-blue-200 shadow-sm'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notif.isRead ? 'bg-gray-100' : 'bg-blue-100'
                  }`}>
                    {notif.type === 'medical_camp' ? (
                      <Stethoscope className={`w-5 h-5 ${notif.isRead ? 'text-gray-500' : 'text-blue-600'}`} />
                    ) : (
                      <Bell className={`w-5 h-5 ${notif.isRead ? 'text-gray-500' : 'text-blue-600'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* EVENTS TAB */
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No events scheduled for your home yet</p>
            </div>
          ) : (
            events.map((event) => {
              const styles = STATUS_STYLES[event.status] || STATUS_STYLES.pending;
              const isCompleted = event.status === 'completed';
              return (
                <div
                  key={event._id}
                  className={`bg-white rounded-2xl border ${styles.border} overflow-hidden hover:shadow-md transition-shadow`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${styles.bg}`}>
                          {event.type === 'medical_camp' ? (
                            <Stethoscope className={`w-6 h-6 ${styles.text}`} />
                          ) : (
                            <Calendar className={`w-6 h-6 ${styles.text}`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900">{event.title}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${styles.badge}`}>
                              {event.status}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(event.date).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                            {event.location && (
                              <span>📍 {event.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedEvent(selectedEvent?._id === event._id ? null : event)}
                        className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                      >
                        Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {selectedEvent?._id === event._id && (
                      <div className={`mt-4 pt-4 border-t border-gray-100`}>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Event Details</p>
                            <div className="space-y-1.5 text-sm text-gray-700">
                              <p><span className="font-medium">Type:</span> {event.type?.replace('_', ' ')}</p>
                              <p><span className="font-medium">Date:</span> {new Date(event.date).toLocaleString('en-IN')}</p>
                              {event.endDate && <p><span className="font-medium">End:</span> {new Date(event.endDate).toLocaleString('en-IN')}</p>}
                              {event.location && <p><span className="font-medium">Location:</span> {event.location}</p>}
                            </div>
                          </div>
                          {isCompleted && event.completionImages?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Uploaded Photos</p>
                              <div className="grid grid-cols-3 gap-2">
                                {event.completionImages.map((img, i) => (
                                  <img key={i} src={img} alt="" className="w-full h-20 object-cover rounded-lg border" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Completion button */}
                        {!isCompleted && event.type === 'medical_camp' && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">Mark Event as Completed</p>
                                <p className="text-sm text-gray-500">Upload photos to make this visible on the public page</p>
                              </div>
                              <button
                                onClick={() => openCompleteModal(event)}
                                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark Complete
                              </button>
                            </div>
                          </div>
                        )}

                        {isCompleted && (
                          <div className="mt-4 flex items-center gap-2 bg-green-50 rounded-xl p-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-sm font-semibold text-green-800">Event Completed</p>
                              {event.completedAt && (
                                <p className="text-xs text-green-600">
                                  {new Date(event.completedAt).toLocaleDateString('en-IN')}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Complete Camp Modal */}
      {showCompleteModal && completingEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mark Camp as Completed</h3>
                <p className="text-sm text-gray-500 mt-0.5">{completingEvent.title}</p>
              </div>
              <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleComplete} className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Upload Camp Photos
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">Click to upload photos</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — multiple files allowed</p>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {previews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {previews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt="" className="w-full h-20 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Completion Notes (optional)</label>
                <textarea
                  value={completeForm.notes}
                  onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Any observations, attendance, outcomes..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-800">
                  Uploaded photos will appear on the public home page under Events.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? 'Saving...' : 'Complete Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
