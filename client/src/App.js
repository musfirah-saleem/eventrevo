// client/src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';

// Public pages
import HomePage from './pages/public/HomePage';
import BrowsePage from './pages/public/BrowsePage';
import DJProfilePage from './pages/public/DJProfilePage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerProfile from './pages/customer/CustomerProfile';
import BookingForm from './pages/customer/BookingForm';
import CheckoutPage from './pages/customer/CheckoutPage';

// DJ pages
import DJDashboard from './pages/dj/DJDashboard';
import DJBookings from './pages/dj/DJBookings';
import DJProfileEdit from './pages/dj/DJProfileEdit';
import DJMedia from './pages/dj/DJMedia';
import DJAvailability from './pages/dj/DJAvailability';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Route guards
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'dj') return <Navigate to="/dashboard/dj" replace />;
    if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    return <Navigate to="/dashboard/customer" replace />;
  }
  return children;
}

// Show/hide nav based on route
const NO_NAV_ROUTES = ['/login', '/register', '/forgot-password'];

export default function App() {
  const { loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
         <Route path="/djs" element={<BrowsePage />} />
        <Route path="/djs/:id" element={<DJProfilePage />} />
        <Route path="/book/:djId" element={<BookingForm />} /> 

        {/* Auth */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Customer */}
        <Route path="/dashboard/customer" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/customer/bookings" element={<ProtectedRoute role="customer"><CustomerBookings /></ProtectedRoute>} />
        <Route path="/dashboard/customer/profile" element={<ProtectedRoute role="customer"><CustomerProfile /></ProtectedRoute>} />
        <Route path="/checkout/:bookingId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

        {/* DJ */}
        <Route path="/dashboard/dj" element={<ProtectedRoute role="dj"><DJDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/dj/bookings" element={<ProtectedRoute role="dj"><DJBookings /></ProtectedRoute>} />
        <Route path="/dashboard/dj/profile" element={<ProtectedRoute role="dj"><DJProfileEdit /></ProtectedRoute>} />
        <Route path="/dashboard/dj/media" element={<ProtectedRoute role="dj"><DJMedia /></ProtectedRoute>} />
        <Route path="/dashboard/dj/availability" element={<ProtectedRoute role="dj"><DJAvailability /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/dashboard/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
