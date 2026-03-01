import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOnboardingStore } from '../global/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/unauthorized'
}) => {
  const location = useLocation();
  const { role: storeRole, token: storeToken } = useOnboardingStore();

  // Check if token exists in store or localStorage
  const hasToken = storeToken || localStorage.getItem('token');

  // If no token exists, redirect to login
  if (!hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get the user role from store
  const userRole = storeRole?.toLowerCase() || 'user';

  // If no required role specified, allow any authenticated user
  if (!requiredRole) {
    return <>{children}</>;
  }

  // Normalize required roles to array
  const requiredRoles = Array.isArray(requiredRole) 
    ? requiredRole.map(r => r.toLowerCase()) 
    : [requiredRole.toLowerCase()];

  // Allow 'rider' or 'driver' to be equivalent, and charter-driver as separate role
  const hasRequiredRole = requiredRoles.includes(userRole) ||
    (requiredRoles.includes('rider') && userRole === 'driver') ||
    (requiredRoles.includes('driver') && userRole === 'rider');

  if (!hasRequiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;