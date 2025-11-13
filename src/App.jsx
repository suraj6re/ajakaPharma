// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import MRDashboard from './pages/MRDashboard';
import ReportVisit from './pages/ReportVisit';
import StockistOrder from './pages/StockistOrder';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import AdminDoctors from './pages/AdminDoctors';
import MyDoctors from './pages/MyDoctors';
import AdminMRs from './pages/AdminMRs';
import AdminProducts from './pages/AdminProducts';
import RequestMRAccess from './pages/RequestMRAccess';
import SetNewPassword from './pages/SetNewPassword';
import AdminMRRequests from './pages/AdminMRRequests';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './services/AuthContext';
import Landing from './pages/Landing';
import PublicNavbar from './components/public/PublicNavbar';
import PublicFooter from './components/public/PublicFooter';

const PublicLayout = () => (
  <div>
    <PublicNavbar />
    <main className="pt-16">
      <Outlet />
    </main>
    <PublicFooter />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1E586E',
              border: '1px solid #1E586E',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#16a34a',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc2626',
                secondary: '#fff',
              },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  return (
    <Routes>
      {/* Public Website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<Landing />} />
        <Route path="/products" element={<Landing />} />
        <Route path="/contact" element={<Landing />} />
        <Route 
          path="/login" 
          element={user ? (user.role?.toLowerCase() === 'admin' ? <Navigate to="/admin-dashboard" replace /> : <Navigate to="/mr-dashboard" replace />) : <Login />} 
        />
        <Route 
          path="/request-mr-access" 
          element={<RequestMRAccess />} 
        />
        <Route 
          path="/set-new-password" 
          element={user ? <SetNewPassword /> : <Navigate to="/login" replace />} 
        />
      </Route>

      {/* Internal App - MR Protected Routes */}
        <Route 
          path="/mr-dashboard" 
          element={
            <ProtectedRoute requiredRole={"MR"}>
              <MRDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/report-visit" 
          element={
            <ProtectedRoute requiredRole={"MR"}>
              <ReportVisit />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stockist-order" 
          element={
            <ProtectedRoute requiredRole={"MR"}>
              <StockistOrder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requiredRole={"MR"}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-doctors" 
          element={
            <ProtectedRoute requiredRole={"MR"}>
              <MyDoctors />
            </ProtectedRoute>
          } 
        />

        {/* Admin Protected Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole={"Admin"}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-reports" 
          element={
            <ProtectedRoute requiredRole={"Admin"}>
              <AdminReports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-doctors" 
          element={
            <ProtectedRoute requiredRole={"Admin"}>
              <AdminDoctors />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-products" 
          element={
            <ProtectedRoute requiredRole={"Admin"}>
              <AdminProducts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-mrs" 
          element={
            <ProtectedRoute requiredRole={"Admin"}>
              <AdminMRs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/mr-requests" 
          element={
            <ProtectedRoute requiredRole={"Admin"}>
              <AdminMRRequests />
            </ProtectedRoute>
          } 
        />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;