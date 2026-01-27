import React, { useEffect } from "react";
import { useOnboardingStore } from "../global/store";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingScreen from "@/pages/dashboard/common/LoadingScreen";

const MainRouter: React.FC = () => {
  const { token, role } = useOnboardingStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token && role) {
      const userRole = role.toLowerCase();
      const currentPath = location.pathname;
      
      // Redirect based on role if not already on the correct route
      if (userRole === 'admin' && !currentPath.startsWith('/admin')) {
        navigate('/admin', { replace: true });
      } else if ((userRole === 'rider' || userRole === 'driver') && !currentPath.includes('driver-dashboard')) {
        navigate('/driver-dashboard', { replace: true });
      } else if (userRole === 'user' && currentPath === '/') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [token, role, navigate, location.pathname]);

  // Show loading while checking auth
  if (token && role) {
    const userRole = role.toLowerCase();
    
    // Show loading screen during redirect
    if ((userRole === 'admin' && !location.pathname.startsWith('/admin')) ||
        ((userRole === 'rider' || userRole === 'driver') && !location.pathname.includes('driver-dashboard'))) {
      return <LoadingScreen />;
    }
  }

  return null; // The actual layout will be rendered by the router
};

export default MainRouter;