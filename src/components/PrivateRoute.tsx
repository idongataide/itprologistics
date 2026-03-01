import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext.tsx';
import { useOnboardingStore } from '../global/store';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const context = useContext(AuthContext);
  const { role: storeRole, token: storeToken } = useOnboardingStore();

  if (!context && !storeToken) {
    // Context not available and no token in store, handle as unauthenticated
    return <Navigate to="/login" replace />;
  }

  const { user, loading } = context || { user: null, loading: false };

  if (loading) {
    return <div>Loading authentication...</div>; // Or a loading spinner
  }

  // Use store role as fallback if context user not available
  const userRole = user?.role || storeRole;

  if (!user && !storeToken) {
    // User not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // User authenticated but unauthorized role
    return <Navigate to="/unauthorized" replace />; // You might want to create an Unauthorized page
  }

  return <Outlet />;
};

export default PrivateRoute;
