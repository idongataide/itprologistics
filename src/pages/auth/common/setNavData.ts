interface iData {
  token?: string;
  user?: {
    id?: string;
    fullname?: string;
    email?: string;
    role?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    is_email_verified?: boolean;
    has_complete_profile?: boolean;
  };
}

interface iNavPath {
  setNavPath: (path: string) => void;
  setEmail: (email: string) => void;
  setToken: (token: string) => void;
  setRole: (role: string) => void;
  setAvatar: (avatar: string) => void;
  setUserName: (userName: string) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setIsVerified: (isVerified: boolean) => void;
  setIsCompleted: (isCompleted: boolean) => void;
}

export const setNavData = (
  navPath: iNavPath,
  email: string,
  res: iData,
  screenPath: string = "",
) => {
  if (!res?.token || !res?.user) return;

  navPath.setNavPath(screenPath);
  navPath.setEmail(email || res.user.email || "");
  navPath.setToken(res.token || "");
  navPath.setRole(res.user.role || "");
  navPath.setAvatar(res.user.avatar || "");
  
  // Split fullname into first and last name if needed
  const fullname = res.user.fullname || "";
  const nameParts = fullname.split(' ');
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(' ') || "";
  
  navPath.setUserName(fullname);
  navPath.setFirstName(firstName);
  navPath.setLastName(lastName);
  
  // Set default values for verification and completion status
  navPath.setIsVerified(res.user.is_email_verified || false);
  navPath.setIsCompleted(res.user.has_complete_profile || false);
};