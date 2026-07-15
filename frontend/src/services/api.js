import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

// Public API
export const getStats = () => api.get('/public/stats');
export const getHomes = (params) => api.get('/public/homes', { params });
export const getHome = (slug) => api.get(`/public/homes/${slug}`);
export const getCalendar = (params) => api.get('/public/calendar', { params });
export const getDonationTracker = () => api.get('/public/donation-tracker');

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const verifyGoogleIdentity = (credential) => api.post('/auth/google/verify', { credential });

// Donations
export const createDonation = (data) => api.post('/donations', data);
export const getDonations = (params) => api.get('/donations', { params });

// Homes
export const registerHome = (data) => {
  // When sending FormData, do not override Content-Type.
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  return api.post('/homes/register', data, isFormData ? {} : undefined);
};

export const addReview = (slug, data) => api.post(`/homes/${slug}/reviews`, data);

// Volunteers
export const registerVolunteer = (data) => api.post('/volunteers/register', data);

// Admin
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getPendingHomes = () => api.get('/admin/homes/pending');
export const getApprovedHomes = () => api.get('/admin/homes/approved');
export const approveHome = (id, data) => api.put(`/admin/homes/${id}/approve`, data);

// Manager
export const getManagerDashboard = () => api.get('/homes/dashboard');
export const updateMyHome = (data) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  return api.put('/homes/my-home', data, isFormData ? {} : undefined);
};

// Residents
export const getResidents = (params) => api.get('/residents', { params });
export const createResident = (data) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  return api.post('/residents', data, isFormData ? {} : undefined);
};
export const updateResident = (id, data) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  return api.put(`/residents/${id}`, data, isFormData ? {} : undefined);
};

// Inventory
export const getInventory = (params) => api.get('/inventory', { params });
export const getNeeds = () => api.get('/homes/needs');
export const addNeed = (data) => api.post('/homes/needs', data);

// Needs Admin
export const getPendingNeeds = () => api.get('/admin/needs/pending');
export const approveNeed = (homeId, needId) => api.put(`/admin/needs/${homeId}/${needId}/approve`);
export const rejectNeed = (homeId, needId) => api.put(`/admin/needs/${homeId}/${needId}/reject`);

// Medical Camps
export const getMedicalCamps = (params) => api.get('/medical-camps', { params });

// Events & Notifications
export const getEvents = (params) => api.get('/events', { params });
export const getNotifications = () => api.get('/notifications');

// Reports
export const generateReport = (params) => api.get('/reports', { params });
