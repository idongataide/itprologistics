import { useEffect } from 'react';
import { useOnboardingStore } from '../global/store';

const AuthInitializer: React.FC = () => {
  const { role, setIsAuthorized } = useOnboardingStore();

  useEffect(() => {
    // Simple initialization - just ensure isAuthorized is set based on role presence
    if (role) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [role, setIsAuthorized]);

  return null; // This component doesn't render anything
};

export default AuthInitializer;