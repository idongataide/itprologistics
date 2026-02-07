import React, { useState, useEffect } from "react";
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
import AdminSidebar from "../pages/admin/components/AdminSidebar";

const { Content } = Layout;

const DashboardLayout: React.FC = () => {
  const datas = useOnboardingStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Get user role from store
  const userRole = datas.role?.toLowerCase() || 'user';
  
  // Determine if user is driver or admin based on role
  const isDriver = userRole === 'driver' || userRole === 'rider';
  const isAdmin = userRole === 'admin';
  const isUser = userRole === 'user';

  useEffect(() => {
    console.log('User role:', userRole, 'isDriver:', isDriver, 'isAdmin:', isAdmin, 'isUser:', isUser);
  }, [userRole, isDriver, isAdmin, isUser]);

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

  // Select navigation based on user role
  let navData = userNavData;
  if (isDriver) {
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
          {/* Desktop Profile Section */}
          <Link
            to={isAdmin ? "/admin" : (isDriver ? "/driver-dashboard/account" : "/account")}
            className="hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              alt="avatar"
              src={datas?.avatar || Images?.avatar}
              className="w-8 h-8 object-contain rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-sm text-[#344054] font-medium">
                {datas?.userName || datas?.email || "Guest"}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {isAdmin ? "Administrator" : userRole}
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
            to={isAdmin ? "/admin" : (isDriver ? "/driver-dashboard/account" : "/account")}
            className="md:hidden flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              alt="avatar"
              src={datas?.avatar || Images?.avatar}
              className="w-8 h-8 object-contain rounded-full"
            />
          </Link>
        </div>
      </div>
    </header>
  );

  // For admin users - show Ant Design layout with sidebar
  if (isAdmin) {
    return (
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
    );
  }

  // For regular users and drivers - show the original layout
  return (
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
  );
};

export default DashboardLayout;