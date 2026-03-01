import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { UserRole } from './context/AuthContext';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Products from './pages/Products';
import Services from './pages/Services';
import Dashboard from './pages/Dashboard';
import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/Products';
import SellerOrders from './pages/seller/Orders';
import SellerReviews from './pages/seller/Reviews';
import SellerProfile from './pages/seller/Profile';
import SellerAIChat from './pages/seller/AIChat';
import SellerNotifications from './pages/seller/Notifications';
import MechanicDashboard from './pages/mechanic/Dashboard';
import ChangePassword from './pages/ChangePassword';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Layout components
import { AdminLayout } from './components/AdminLayout';
import { SellerLayout } from './components/SellerLayout';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsersManagement from './pages/admin/UsersManagement';
import AdminProductsManagement from './pages/admin/ProductsManagement';
import AdminOrdersManagement from './pages/admin/OrdersManagement';
import AdminNotifications from './pages/admin/Notifications';
import AdminContactManagement from './pages/admin/ContactManagement';
import AdminSettingsPage from './pages/admin/SettingsPage';
import AdminNotFound from './pages/admin/NotFound';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface RouteProps {
  children: React.ReactNode;
}

interface RoleRouteProps {
  children: React.ReactNode;
  roles: UserRole[];
}

const PrivateRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (user) {
    // Admin → admin panel, Seller → seller dashboard, Mechanic → mechanic dashboard, others → user dashboard
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'seller') return <Navigate to="/seller/dashboard" />;
    if (user.role === 'mechanic') return <Navigate to="/mechanic/dashboard" />;
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// Role-based route protection
export const RoleRoute: React.FC<RoleRouteProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Public pages - accessible to everyone */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/products" element={<Products />} />
              <Route path="/services" element={<Services />} />
              
              {/* Auth pages - redirect to dashboard if already logged in */}
              <Route path="/login" element={
                <PublicRoute><Login /></PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute><Register /></PublicRoute>
              } />
              
              {/* Protected pages - require login */}
              <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />

              {/* Seller panel - requires seller role */}
              <Route path="/seller/dashboard" element={
                <RoleRoute roles={['seller']}>
                  <SellerLayout><SellerDashboard /></SellerLayout>
                </RoleRoute>
              } />
              <Route path="/seller/products" element={
                <RoleRoute roles={['seller']}>
                  <SellerLayout><SellerProducts /></SellerLayout>
                </RoleRoute>
              } />
              <Route path="/seller/orders" element={
                <RoleRoute roles={['seller']}>
                  <SellerLayout><SellerOrders /></SellerLayout>
                </RoleRoute>
              } />
              <Route path="/seller/reviews" element={
                <RoleRoute roles={['seller']}>
                  <SellerLayout><SellerReviews /></SellerLayout>
                </RoleRoute>
              } />
              <Route path="/seller/profile" element={
                <RoleRoute roles={['seller']}>
                  <SellerLayout><SellerProfile /></SellerLayout>
                </RoleRoute>
              } />
              <Route path="/seller/ai-chat" element={
                <RoleRoute roles={['seller']}>
                  <SellerLayout><SellerAIChat /></SellerLayout>
                </RoleRoute>
              } />
              <Route path="/seller/notifications" element={
                <RoleRoute roles={['seller']}>
                  <SellerLayout><SellerNotifications /></SellerLayout>
                </RoleRoute>
              } />

              {/* Mechanic dashboard */}
              <Route path="/mechanic/dashboard" element={
                <RoleRoute roles={['mechanic']}>
                  <MechanicDashboard />
                </RoleRoute>
              } />

              {/* Change Password - all authenticated users */}
              <Route path="/change-password" element={
                <PrivateRoute>
                  <ChangePassword />
                </PrivateRoute>
              } />

              {/* Admin panel - requires admin role */}
              <Route path="/admin" element={
                <RoleRoute roles={['admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </RoleRoute>
              } />
              <Route path="/admin/users" element={
                <RoleRoute roles={['admin']}>
                  <AdminLayout>
                    <AdminUsersManagement />
                  </AdminLayout>
                </RoleRoute>
              } />
              <Route path="/admin/products" element={
                <RoleRoute roles={['admin']}>
                  <AdminLayout>
                    <AdminProductsManagement />
                  </AdminLayout>
                </RoleRoute>
              } />
              <Route path="/admin/orders" element={
                <RoleRoute roles={['admin']}>
                  <AdminLayout>
                    <AdminOrdersManagement />
                  </AdminLayout>
                </RoleRoute>
              } />
              <Route path="/admin/notifications" element={
                <RoleRoute roles={['admin']}>
                  <AdminLayout>
                    <AdminNotifications />
                  </AdminLayout>
                </RoleRoute>
              } />
              <Route path="/admin/contacts" element={
                <RoleRoute roles={['admin']}>
                  <AdminLayout>
                    <AdminContactManagement />
                  </AdminLayout>
                </RoleRoute>
              } />
              <Route path="/admin/settings" element={
                <RoleRoute roles={['admin']}>
                  <AdminLayout>
                    <AdminSettingsPage />
                  </AdminLayout>
                </RoleRoute>
              } />
              <Route path="/admin/*" element={
                <RoleRoute roles={['admin']}>
                  <AdminLayout>
                    <AdminNotFound />
                  </AdminLayout>
                </RoleRoute>
              } />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
