import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { UserRole } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Products = lazy(() => import('./pages/Products'));
const Services = lazy(() => import('./pages/Services'));
const PublicSellerProfile = lazy(() => import('./pages/PublicSellerProfile'));
const PublicMechanicProfile = lazy(() => import('./pages/PublicMechanicProfile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SellerDashboard = lazy(() => import('./pages/seller/Dashboard'));
const SellerProducts = lazy(() => import('./pages/seller/Products'));
const SellerOrders = lazy(() => import('./pages/seller/Orders'));
const SellerReviews = lazy(() => import('./pages/seller/Reviews'));
const SellerProfile = lazy(() => import('./pages/seller/Profile'));
const SellerAIChat = lazy(() => import('./pages/seller/AIChat'));
const SellerNotifications = lazy(() => import('./pages/seller/Notifications'));
const MechanicDashboard = lazy(() => import('./pages/mechanic/Dashboard'));
const MechanicProducts = lazy(() => import('./pages/mechanic/Products'));
const MechanicOrders = lazy(() => import('./pages/mechanic/Orders'));
const MechanicReviews = lazy(() => import('./pages/mechanic/Reviews'));
const MechanicProfile = lazy(() => import('./pages/mechanic/Profile'));
const MechanicAIChat = lazy(() => import('./pages/mechanic/AIChat'));
const MechanicServices = lazy(() => import('./pages/mechanic/Services'));
const MechanicNotifications = lazy(() => import('./pages/mechanic/Notifications'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const BuyerAIChat = lazy(() => import('./pages/BuyerAIChat'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminLayout = lazy(() => import('./components/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const SellerLayout = lazy(() => import('./components/SellerLayout').then((m) => ({ default: m.SellerLayout })));
const MechanicLayout = lazy(() => import('./components/MechanicLayout').then((m) => ({ default: m.MechanicLayout })));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsersManagement = lazy(() => import('./pages/admin/UsersManagement'));
const AdminProductsManagement = lazy(() => import('./pages/admin/ProductsManagement'));
const AdminServicesManagement = lazy(() => import('./pages/admin/ServicesManagement'));
const AdminOrdersManagement = lazy(() => import('./pages/admin/OrdersManagement'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminContactManagement = lazy(() => import('./pages/admin/ContactManagement'));
const AdminSettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const AdminNotFound = lazy(() => import('./pages/admin/NotFound'));

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

const RouteLoader: React.FC = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const App = (): JSX.Element => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app">
            <Suspense fallback={<RouteLoader />}>
              <Routes>
              {/* Public pages - accessible to everyone */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/services" element={<Services />} />
              <Route path="/seller/:id" element={<PublicSellerProfile />} />
              <Route path="/mechanic/:id" element={<PublicMechanicProfile />} />
              
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
              <Route path="/my-orders" element={
                <PrivateRoute><MyOrders /></PrivateRoute>
              } />
              <Route path="/ai-chat" element={
                <PrivateRoute><BuyerAIChat /></PrivateRoute>
              } />
              <Route path="/chat" element={
                <PrivateRoute><ChatPage /></PrivateRoute>
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
              <Route path="/seller/chat" element={
                <RoleRoute roles={['seller']}>
                  <SellerLayout><ChatPage /></SellerLayout>
                </RoleRoute>
              } />
              <Route path="/seller/notifications" element={
                <RoleRoute roles={['seller']}>
                  <SellerLayout><SellerNotifications /></SellerLayout>
                </RoleRoute>
              } />

              {/* Mechanic panel - requires mechanic role */}
              <Route path="/mechanic/dashboard" element={
                <RoleRoute roles={['mechanic']}>
                  <MechanicLayout><MechanicDashboard /></MechanicLayout>
                </RoleRoute>
              } />
              <Route path="/mechanic/services" element={
                <RoleRoute roles={['mechanic']}>
                  <MechanicLayout><MechanicServices /></MechanicLayout>
                </RoleRoute>
              } />
              <Route path="/mechanic/products" element={
                <RoleRoute roles={['mechanic']}>
                  <MechanicLayout><MechanicProducts /></MechanicLayout>
                </RoleRoute>
              } />
              <Route path="/mechanic/orders" element={
                <RoleRoute roles={['mechanic']}>
                  <MechanicLayout><MechanicOrders /></MechanicLayout>
                </RoleRoute>
              } />
              <Route path="/mechanic/reviews" element={
                <RoleRoute roles={['mechanic']}>
                  <MechanicLayout><MechanicReviews /></MechanicLayout>
                </RoleRoute>
              } />
              <Route path="/mechanic/profile" element={
                <RoleRoute roles={['mechanic']}>
                  <MechanicLayout><MechanicProfile /></MechanicLayout>
                </RoleRoute>
              } />
              <Route path="/mechanic/ai-chat" element={
                <RoleRoute roles={['mechanic']}>
                  <MechanicLayout><MechanicAIChat /></MechanicLayout>
                </RoleRoute>
              } />
              <Route path="/mechanic/chat" element={
                <RoleRoute roles={['mechanic']}>
                  <MechanicLayout><ChatPage /></MechanicLayout>
                </RoleRoute>
              } />
              <Route path="/mechanic/notifications" element={
                <RoleRoute roles={['mechanic']}>
                  <MechanicLayout><MechanicNotifications /></MechanicLayout>
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
              <Route path="/admin/services" element={
                <RoleRoute roles={['admin']}>
                  <AdminLayout>
                    <AdminServicesManagement />
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
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
