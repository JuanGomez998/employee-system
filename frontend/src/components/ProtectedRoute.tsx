import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
  requiredRole?: "admin" | "employee";
  userRole?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication and/or specific roles.
 * Redirects to /clock if not authenticated or lacking required role.
 * 
 * Usage:
 * <ProtectedRoute isAuthenticated={isAuth} requiredRole="admin">
 *   <Dashboard />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({
  children,
  isAuthenticated,
  requiredRole,
  userRole,
}: ProtectedRouteProps) => {
  // Redirect to clock if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check role if required
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
