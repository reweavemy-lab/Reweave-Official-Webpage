import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import AdminLayout from "@/components/admin/AdminLayout"

// Public pages
import Home from "@/pages/Home"
import Shop from "@/pages/Shop"

// Auth pages
import Login from "@/pages/auth/Login"
import Register from "@/pages/auth/Register"

// User dashboard
import UserDashboard from "@/pages/UserDashboard"

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard"
import OrderManagement from "@/pages/admin/OrderManagement"
import ProductManagement from "@/pages/admin/ProductManagement"
import InventoryManagement from "@/pages/admin/InventoryManagement"
import CustomerManagement from "@/pages/admin/CustomerManagement"
import ImpactDashboard from "@/pages/admin/ImpactDashboard"
import MarketingDashboard from "@/pages/admin/MarketingDashboard"
import AutomationPanel from "@/pages/admin/AutomationPanel"
import CustomerJourney from "@/pages/admin/CustomerJourney"
import PopupDashboard from "@/pages/admin/PopupDashboard"
import PageEditor from "@/pages/admin/PageEditor"

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin/login" />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Authentication Routes */}
        <Route path="/auth/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/auth/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="journey" element={<CustomerJourney />} />
              <Route path="popup" element={<PopupDashboard />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="page-editor" element={<PageEditor />} />
              <Route path="impact" element={<ImpactDashboard />} />
              <Route path="marketing" element={<MarketingDashboard />} />
              <Route path="automation" element={<AutomationPanel />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        } />
        
        <Route path="/shop" element={<Shop />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}