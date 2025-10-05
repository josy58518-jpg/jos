import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Context providers for state management
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { MenuProvider } from './contexts/MenuContext';

// Page components
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CustomerDashboard from './pages/customer/Dashboard';
import RestaurantDashboard from './pages/restaurant/Dashboard';
import DeliveryDashboard from './pages/delivery/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import RestaurantDetail from './pages/customer/RestaurantDetail';
import MyOrders from './pages/customer/MyOrders';
import ManageMenu from './pages/restaurant/ManageMenu';
import RestaurantOrders from './pages/restaurant/Orders';
import DeliveryJobs from './pages/delivery/Jobs';
import AdminUsers from './pages/admin/Users';
import AdminRestaurants from './pages/admin/Restaurants';
import './index.css';

/**
 * Protected Route Component
 * Ensures only authenticated users with proper roles can access specific routes
 * @param children - React components to render if authorized
 * @param allowedRoles - Array of user roles that can access this route
 */
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user } = useAuth();
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to home if user doesn't have required role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

/**
 * App Routes Component
 * Defines all application routes with role-based access control
 */
function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to={`/${user.role}`} replace /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Customer Routes - Only accessible by customers */}
      <Route path="/customer" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/restaurant/:id" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <RestaurantDetail />
        </ProtectedRoute>
      } />
      <Route path="/my-orders" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <MyOrders />
        </ProtectedRoute>
      } />
      
      {/* Restaurant Owner Routes - Only accessible by restaurant owners */}
      <Route path="/owner" element={
        <ProtectedRoute allowedRoles={['owner']}>
          <RestaurantDashboard />
        </ProtectedRoute>
      } />
      <Route path="/manage-menu" element={
        <ProtectedRoute allowedRoles={['owner']}>
          <ManageMenu />
        </ProtectedRoute>
      } />
      <Route path="/restaurant-orders" element={
        <ProtectedRoute allowedRoles={['owner']}>
          <RestaurantOrders />
        </ProtectedRoute>
      } />
      
      {/* Delivery Agent Routes - Only accessible by delivery agents */}
      <Route path="/agent" element={
        <ProtectedRoute allowedRoles={['agent']}>
          <DeliveryDashboard />
        </ProtectedRoute>
      } />
      <Route path="/delivery-jobs" element={
        <ProtectedRoute allowedRoles={['agent']}>
          <DeliveryJobs />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes - Only accessible by administrators */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/restaurants" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminRestaurants />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

/**
 * Main App Component
 * Sets up context providers and routing for the entire application
 * Context hierarchy ensures proper data flow and state management
 */
function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <MenuProvider>
          <CartProvider>
            <OrderProvider>
              <Router>
                <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
                  <AppRoutes />
                </div>
              </Router>
            </OrderProvider>
          </CartProvider>
        </MenuProvider>
      </RestaurantProvider>
    </AuthProvider>
  );
}

export default App;