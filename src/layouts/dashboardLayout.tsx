import React, { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  IoIosArrowForward, 
  IoIosHome, 
  IoIosCalendar, 
  IoIosPerson,
  IoIosCar,
  IoIosLogOut 
} from "react-icons/io";
import { Layout } from 'antd';
import { useOnboardingStore } from "../global/store";
import Images from "@/components/images";
import NotificationsSidebar, { Notification } from '@/components/NotificationsSidebar';
import AdminSidebar from "../pages/admin/components/AdminSidebar";
import { API_URL } from '@/services/config/api';

const { Content } = Layout;

// Remove the local NotificationType interface and use the imported one
// or keep it but make sure it matches exactly

const DashboardLayout: React.FC = () => {
  const datas = useOnboardingStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevNotificationsRef = useRef<Notification[]>([]);
  const isFirstFetchRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // simple auth header helper for API calls
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Get user role from store
  const userRole = datas.role?.toLowerCase() || 'user';
  
  // Determine if user is driver or admin based on role
  const isDriver = userRole === 'driver' || userRole === 'rider';
  const isCharterDriver = userRole === 'charter-driver';
  const isAdmin = userRole === 'admin';
  const isUser = userRole === 'user';

  useEffect(() => {
    console.log('User role:', userRole, 'isDriver:', isDriver, 'isCharterDriver:', isCharterDriver, 'isAdmin:', isAdmin, 'isUser:', isUser);
  }, [userRole, isDriver, isCharterDriver, isAdmin, isUser]);

  // Fetch notifications with improved logic
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.notifications)) {
        // Map the API response to match the Notification interface
        const newNotifications: Notification[] = data.notifications.map((n: any) => ({
          _id: n._id || n.id,
          userId: n.userId || '',
          type: n.type || 'notification',
          title: n.title || 'Notification',
          message: n.message || '',
          orderId: n.orderId,
          driverId: n.driverId,
          vehicleId: n.vehicleId,
          isRead: n.isRead || n.read || n.status === 1 || false,
          readAt: n.readAt || null,
          data: n.data,
          createdAt: n.createdAt || new Date().toISOString(),
          updatedAt: n.updatedAt || new Date().toISOString(),
        }));
        
        // Check for new notifications by comparing IDs (skip on first fetch)
        const prevIds = new Set(prevNotificationsRef.current.map(n => n._id));
        const hasNewNotification = !isFirstFetchRef.current && newNotifications.some((n: Notification) => !prevIds.has(n._id));
        
        // Play sound if there's a new notification and sidebar is closed
        if (hasNewNotification && audioRef.current && !notifOpen) {
          audioRef.current.play().catch(() => {});
        }
        
        // Mark first fetch as complete
        if (isFirstFetchRef.current) {
          isFirstFetchRef.current = false;
        }
        
        // Update unread count
        const unread = newNotifications.filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
        
        // Update state and ref
        setNotifications(newNotifications);
        prevNotificationsRef.current = newNotifications;
      }
    } catch (err) {
      console.error('failed to fetch notifications', err);
    }
  }, [notifOpen]);

  // Initial fetch and interval setup
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 10000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Mark notifications as read when sidebar opens
  const handleNotifOpen = useCallback(async () => {
    setNotifOpen(true);
    // Mark only the currently displayed unread notifications as read
    if (unreadCount > 0) {
      try {
        const unreadNotifications = notifications.filter(
          (n: Notification) => !n.isRead
        );
        
        // Mark each unread notification individually
        for (const notification of unreadNotifications) {
          await fetch(`${API_URL}/notifications/${notification._id}/read`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
          });
        }
        
        // Update local state - mark displayed ones as read
        const updatedNotifications = notifications.map((n: Notification) =>
          unreadNotifications.some(un => un._id === n._id) ? { ...n, isRead: true } : n
        );
        setNotifications(updatedNotifications);
        setUnreadCount(0);
      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    }
  }, [unreadCount, notifications]);

  const handleNotifClose = useCallback(() => {
    setNotifOpen(false);
  }, []);

  const handleLogout = () => {
    useOnboardingStore.persist.clearStorage(); 
    localStorage.clear(); 
    sessionStorage.clear(); 
    useOnboardingStore.setState({ 
      token: null, 
      isAuthorized: false, 
      firstName: "", 
      lastName: "",
      role: "",
      email: "",
      userName: ""
    });
    navigate("/login");
  };

  // User navigation (regular customers)
  const userNavData = [
    {
      id: 1,
      title: "Dashboard",
      URL: "dashboard",
      icon: <IoIosHome className="text-2xl" />,
      roles: ['user']
    },
    {
      id: 2,
      title: "Orders",
      URL: "rides",
      icon: <IoIosCalendar className="text-2xl" />,
      roles: ['user']
    },
    {
      id: 3,
      title: "Charter",
      URL: "charter",
      icon: <IoIosCalendar className="text-2xl" />,
      roles: ['user']
    },
    {
      id: 4,
      title: "Account",
      URL: "account",
      icon: <IoIosPerson className="text-2xl" />,
      roles: ['user', 'driver', 'admin']
    },
  ];

  // Driver/Rider navigation
  const driverNavData = [
    {
      id: 1,
      title: "Dashboard",
      URL: "driver-dashboard",
      icon: <IoIosHome className="text-2xl" />,
      roles: ['driver', 'rider']
    },
    {
      id: 2,
      title: "Rides",
      URL: "driver-dashboard/rides",
      icon: <IoIosCar className="text-2xl" />,
      roles: ['driver', 'rider']
    },
    {
      id: 3,
      title: "Account",
      URL: "driver-dashboard/account",
      icon: <IoIosPerson className="text-2xl" />,
      roles: ['driver', 'rider', 'admin']
    },
  ];

  // Charter Driver navigation
  const charterDriverNavData = [
    {
      id: 1,
      title: "Requests",
      URL: "driver-dashboard",
      icon: <IoIosHome className="text-2xl" />,
      roles: ['charter-driver']
    },
    {
      id: 2,
      title: "Account",
      URL: "driver-dashboard/account",
      icon: <IoIosPerson className="text-2xl" />,
      roles: ['charter-driver']
    },
  ];

  // Select navigation based on user role
  let navData = userNavData;
  if (isCharterDriver) {
    navData = charterDriverNavData;
  } else if (isDriver) {
    navData = driverNavData;
  }
  
  // Filter navigation items based on user's role
  const filteredNavData = navData.filter(item => 
    item.roles.includes(userRole) || item.roles.includes('*')
  );

  const handleStart = pathname.split("/")[1] === "" ? true : false;

  // Function to render the common header
  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-[999] bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        {/* Logo */}
        <Link to={isAdmin ? "/admin" : "/"} className="flex items-center">
          <img src={Images.logodark} className="h-[50px]" alt="logo" />
        </Link>

        {/* Desktop Navigation Links - Only show for non-admin users */}
        {!isAdmin && (
          <nav className="hidden md:flex items-center gap-8">
            {filteredNavData.map((item) => (
              <NavLink
                to={`/${item.URL}`}
                key={item.id}
                className={({ isActive }) =>
                  `text-base font-medium transition-colors ${
                    isActive || (handleStart && item.URL === "home")
                      ? "text-[#E86229] border-b-2 border-[#E86229] pb-1"
                      : "text-[#344054] hover:text-[#E86229]"
                  }`
                }
              >
                {item.title}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right Side Icons and Profile */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Notification bell */}
          <button
            onClick={handleNotifOpen}
            className="relative text-gray-600 hover:text-[#E86229]"
            title="Notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {/* Desktop Profile Section */}
          <Link
            to={isAdmin ? "/admin" : (isDriver || isCharterDriver ? "/driver-dashboard/account" : "/account")}
            className="hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {datas?.avatar ? (
              <img
                alt="avatar"
                src={datas?.avatar || Images?.avatar}
                className="w-8 h-8 object-contain rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <IoIosPerson className="text-gray-600" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm text-[#344054] font-medium">
                {datas?.userName || datas?.email || "Guest"}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {isAdmin ? "Administrator" : isCharterDriver ? "Charter Driver" : userRole}
              </span>
            </div>
            <IoIosArrowForward className="text-[16px] text-gray-500" />
          </Link>
          
          {/* Desktop Logout Button */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-[#E86229] transition-colors cursor-pointer"
            title="Logout"
          >
            <IoIosLogOut className="text-[18px]" />
            <span className="hidden lg:inline">Logout</span>
          </button>
          
          {/* Mobile Profile Icon */}
          <Link
            to={isAdmin ? "/admin" : (isDriver || isCharterDriver ? "/driver-dashboard/account" : "/account")}
            className="md:hidden flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            {datas?.avatar ? (
              <img
                alt="avatar"
                src={datas?.avatar || Images?.avatar}
                className="w-8 h-8 object-contain rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <IoIosPerson className="text-gray-600" />
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );

  // For admin users - show Ant Design layout with sidebar
  if (isAdmin) {
    return (
      <>
        <audio ref={audioRef} src="/alert.wav" />
        <NotificationsSidebar
          isOpen={notifOpen}
          onClose={handleNotifClose}
          notifications={notifications}
        />
        <Layout style={{ minHeight: '100vh' }}>
          {/* Fixed Sidebar */}
          <AdminSidebar 
            collapsed={collapsed} 
            onCollapse={setCollapsed}
            toggleCollapsed={() => setCollapsed(!collapsed)}
          />
          
          <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
            {/* Fixed Header */}
            {renderHeader()}
            
            {/* Main Content */}
            <Content
              style={{
                marginTop: '80px', // Header height
                padding: 10,
                background: '#fff',
                minHeight: 'calc(100vh - 80px)',
                overflow: 'auto',
              }}
            >
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </>
    );
  }

  // For regular users and drivers - show the original layout
  return (
    <>
      <audio ref={audioRef} src="/alert.wav" />
      <NotificationsSidebar
        isOpen={notifOpen}
        onClose={handleNotifClose}
        notifications={notifications}
      />
      <main className="overflow-hidden bg-white">
        {/* Header */}
        {renderHeader()}

        {/* Main Content */}
        <div className="pt-20 min-h-screen bg-[#fff] pb-16 md:pb-0">
          <section className={pathname === "/" || pathname === "/home" ? "p-0" : "md:px-6 p-0 py-6"}>
            <Outlet />
          </section>
        </div>

        {/* Mobile Bottom Navigation - Only for non-admin users */}
        <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-gray-200 md:hidden">
          <div className="flex items-center justify-around py-3">
            {filteredNavData.map((item) => (
              <NavLink
                to={`/${item.URL}`}
                key={item.id}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center transition-colors ${
                    isActive || (handleStart && item.URL === "home")
                      ? "text-[#E86229]"
                      : "text-gray-500"
                  }`
                }
              >
                <div className="text-2xl">
                  {item.icon}
                </div>
                <span className="text-xs mt-1 font-medium">
                  {item.title}
                </span>
              </NavLink>
            ))}
            
            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center text-gray-500 hover:text-[#E86229] transition-colors cursor-pointer"
              title="Logout"
            >
              <IoIosLogOut className="text-2xl" />
              <span className="text-xs mt-1 font-medium">
                Logout
              </span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default DashboardLayout;