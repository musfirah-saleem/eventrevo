// client/src/utils/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('er_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('er_token');
      localStorage.removeItem('er_user');
      // If the 401 comes from auth endpoints used for login/register/forgot-password,
      // don't force a redirect to /login. Let the calling code handle the error so
      // the UI can show a proper message without a full page reload that would
      // clear input state. For other endpoints (protected routes) keep the
      // existing behavior and sign the user out.
      const reqUrl = (err.config?.url || '').toString();
      const noRedirectPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];
      // Match if the request url contains any of the auth-related paths (covers prefixed or full URLs)
      const isAuthPath = noRedirectPaths.some(p => reqUrl.includes(p));

      if (!isAuthPath) {
        // For non-auth endpoints, sign the user out and redirect to login
        localStorage.removeItem('er_token');
        localStorage.removeItem('er_user');
        window.location.href = '/login';
      }
      // Otherwise, fall through and reject so the caller can display errors.
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// ── DJs
export const djAPI = {
  getAll: (params) => api.get('/djs', { params }),
  getOne: (id) => api.get(`/djs/${id}`),
  getMyProfile: () => api.get('/djs/me'),
  updateMyProfile: (data) => api.put('/djs/me', data),
  addMedia: (data) => api.post('/djs/me/media', data),
  removeMedia: (id) => api.delete(`/djs/me/media/${id}`),
  updateAvailability: (data) => api.put('/djs/me/availability', data),
  blockDate: (data) => api.post('/djs/me/block-date', data),
  unblockDate: (id) => api.delete(`/djs/me/block-date/${id}`),
};

// ── Bookings
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getOne: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, action) => api.patch(`/bookings/${id}`, { action }),
};

// ── Uploads
export const uploadAPI = {
  profileImage: (formData) => api.post('/uploads/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  galleryImage: (formData) => api.post('/uploads/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteGallery: (url) => api.delete('/uploads/gallery', { data: { url } }),
};

// ── Reviews
export const reviewAPI = {
  getForDJ: (djId) => api.get(`/reviews/dj/${djId}`),
  create: (data) => api.post('/reviews', data),
};

// ── Admin
export const adminAPI = {
  getDJs: () => api.get('/admin/djs'),
  updateDJStatus: (id, status) => api.patch(`/admin/djs/${id}`, { status }),
  getBookings: () => api.get('/admin/bookings'),
  getStats: () => api.get('/admin/stats'),
};

// ── Stripe
export const stripeAPI = {
  createPaymentIntent: (bookingId) => api.post('/stripe/create-payment-intent', { bookingId }),
};

// ── Calendar
export const calendarAPI = {
  getAuthUrl: () => api.get('/calendar/auth-url'),
};
