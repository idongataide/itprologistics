import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext.tsx';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const context = useContext(AuthContext);

  if (!context) {
    // Context not available, handle as unauthenticated
    return <Navigate to="/login" replace />;
  }

  const { user, loading } = context;

  if (loading) {
    return <div>Loading authentication...</div>; // Or a loading spinner
  }

  if (!user) {
    // User not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User authenticated but unauthorized role
    return <Navigate to="/unauthorized" replace />; // You might want to create an Unauthorized page
  }

  return <Outlet />;
};

export default PrivateRoute;
