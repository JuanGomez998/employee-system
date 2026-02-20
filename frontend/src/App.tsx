import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages
import Clock from "./pages/Clock";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Reports from "./pages/Reports";
import Payroll from "./pages/Payroll";

// Components
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/AdminLayout";

// Auth utilities
import {
  login,
  getCurrentUser,
  removeToken,
  getToken,
  decodeToken,
  setToken,
} from "./utils/auth";
import type { User } from "./utils/auth";

import "./index.css";
import "./layout.css";

/**
 * AdminApp Component
 * Wrapper for all protected admin routes with sidebar and layout
 */
function AdminApp({
  darkMode,
  setDarkMode,
  onLogout,
  user,
}: {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onLogout: () => void;
  user: User | null;
}) {
  return (
    <AdminLayout
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      onLogout={onLogout}
      userName={user?.username}
    >
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="reports" element={<Reports />} />
        <Route path="attendance" element={<Navigate to="/admin/reports" replace />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

/**
 * Main App Component
 * Routes:
 * / - Clock interface (public)
 * /admin/* - Protected admin routes
 * /login - Admin login (TODO)
 */
function AppContent() {
  const [darkMode, setDarkMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token is not expired
      const decoded = decodeToken(token);
      if (!decoded) {
        // Token is expired or invalid
        removeToken();
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error fetching user:", error);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleLogin = async (username: string, password: string) => {
    const result = await login(username, password);
    setToken(result.token);
    setUser(result.user);
    setIsAuthenticated(true);
    return true;
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#1a1a2e",
          color: "#fff",
          fontSize: "20px",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Clock Route */}
      <Route path="/" element={<Clock />} />

      {/* Admin Login */}
      <Route
        path="/login"
        element={
          <Login isAuthenticated={isAuthenticated} onLogin={handleLogin} />
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            userRole={user?.role}
            requiredRole="admin"
          >
            <AdminApp
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onLogout={handleLogout}
              user={user}
            />
          </ProtectedRoute>
        }
      />

      {/* Redirect unknown routes to clock */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Root App Component with Router
 */
export default function App() {
  return (
    <Router>
      <AppContent />
      <Toaster position="top-right" />
    </Router>
  );
}