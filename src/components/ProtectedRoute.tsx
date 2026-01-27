import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOnboardingStore } from '../global/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'rider' | 'driver' | 'user';
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'admin',
  fallbackPath = '/unauthorized'
}) => {
  const location = useLocation();
  const { role, token } = useOnboardingStore();

  // Check if token exists in store or localStorage
  const hasToken = token || localStorage.getItem('token');

  // If no token exists, redirect to login
  if (!hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role
  const userRole = role?.toLowerCase();
  const normalizedRequiredRole = requiredRole?.toLowerCase();

  // Allow 'rider' or 'driver' to be equivalent
  const hasRequiredRole = userRole === normalizedRequiredRole ||
    (normalizedRequiredRole === 'rider' && userRole === 'driver') ||
    (normalizedRequiredRole === 'driver' && userRole === 'rider');

  if (!hasRequiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;