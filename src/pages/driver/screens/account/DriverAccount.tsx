import React from 'react';
import { Card, Typography, Tag, Divider } from 'antd';
import {
  UserOutlined,
  CarOutlined,
  LockOutlined,
  LogoutOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';

const DriverAccountLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Simulate logout
    console.log("Driver Logout");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">         
          <div>
            <h3 className="text-gray-800 text-2xl font-bold">Account Management</h3>
            <p className="text-gray-600">View and manage your driver account information</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <Card 
            className="lg:w-1/4 border-0 shadow-sm rounded-xl"
            bodyStyle={{ padding: '24px' }}
          >
           
            
           <nav className="flex flex-col space-y-1 mb-8">
              <NavLink
                to="/driver-dashboard/account"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg text-base font-medium transition-all ${isActive 
                    ? '!bg-gradient-to-r !from-orange-50 !to-orange-50 !text-[#E86229] !border-l-4 !border-[#E86229]' 
                    : '!text-gray-600 hover:!bg-gray-50 hover:!border-l-4 hover:!border-gray-200'}`
                }
              >
                <UserOutlined className="text-lg" />
                <span>Profile Information</span>
              </NavLink>
              <NavLink
                to="/driver-dashboard/account/change-password"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg text-base font-medium transition-all ${isActive 
                    ? '!bg-gradient-to-r !from-orange-50 !to-orange-50 !text-[#E86229] !border-l-4 !border-[#E86229]' 
                    : '!text-gray-600 hover:!bg-gray-50 hover:!border-l-4 hover:!border-gray-200'}`
                }
              >
                <LockOutlined className="text-lg" />
                <span>Password & Security</span>
              </NavLink>
              <NavLink
                to="/driver-dashboard/account/vehicle-info"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg text-base font-medium transition-all ${isActive 
                    ? '!bg-gradient-to-r !from-orange-50 !to-orange-50 !text-[#E86229] !border-l-4 !border-[#E86229]' 
                    : '!text-gray-600 hover:!bg-gray-50 hover:!border-l-4 hover:!border-gray-200'}`
                }
              >
                <CarOutlined className="text-lg" />
                <span>Vehicle Details</span>
              </NavLink>
            </nav>

            <Divider className="my-6" />
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-lg w-full text-left transition-colors group"
            >
              <LogoutOutlined className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Sign Out</span>
            </button>
          </Card>

          {/* Account Content */}
          <div className="lg:w-3/4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

const DriverProfile: React.FC = () => (
  <Card 
    className="border-0 shadow-sm rounded-xl">
    <div className="mb-8">
      <h3  className="text-gray-800 font-bold text-lg mb-2">Profile Information</h3>
      <p className="text-gray-500">
        Your personal and account details
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserOutlined className="text-gray-400" />
            <p className="text-gray-600">Full Name</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 text-base">John Doe</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <MailOutlined className="text-gray-400" />
            <p className="text-gray-600">Email Address</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 text-base">john.doe@example.com</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <PhoneOutlined className="text-gray-400" />
            <p className="text-gray-600">Phone Number</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 text-base">+1 (555) 123-4567</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <IdcardOutlined className="text-gray-400" />
            <p className="text-gray-600">Driver ID</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-gray-800 text-base font-mono">DRV12345</p>
              <Tag color="green" className="ml-2">Active</Tag>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <SafetyCertificateOutlined className="text-gray-400" />
            <p className="text-gray-600">Account Status</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-gray-800">Verified Driver</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-gray-600">Member Since</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800">January 15, 2023</p>
          </div>
        </div>
      </div>
    </div>

    <Divider className="my-8" />
    
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
      <div className="flex items-start gap-3">
        <InfoCircleOutlined className="text-blue-500 text-lg mt-1" />
        <div>
          <p className="text-blue-800">Need to update your information?</p>
          <p className="text-blue-600 block mt-1">
            Contact support at support@itprolimited.com or call +1 (800) 123-4567
          </p>
        </div>
      </div>
    </div>
  </Card>
);

const DriverChangePassword: React.FC = () => (
  <Card 
    className="border-0 shadow-sm rounded-xl"
    bodyStyle={{ padding: '32px' }}
  >
    <div className="mb-8">
      <h3  className="text-gray-800 font-bold text-lg mb-2">Password & Security</h3>
      <p className="text-gray-500">
        Manage your account security settings
      </p>
    </div>

    <div className="space-y-6 max-w-lg">
   

      <div className="p-6 bg-amber-50 rounded-xl border border-amber-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <LockOutlined className="text-amber-600 text-lg" />
          </div>
          <div>
            <p className="text-amber-800 text-base">Password Reset</p>
            <p className="text-amber-700 block mt-2">
              For security reasons, password changes require verification. Please contact 
              driver support to reset your password.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <PhoneOutlined className="text-blue-600 text-lg" />
          </div>
          <div>
            <p className="text-blue-800 text-base">Contact Support</p>
            <p className="text-blue-700 block mt-2">
              Email: security@example.com
              <br />
              Phone: +1 (800) 123-4567 (24/7)
            </p>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

const DriverVehicleInfo: React.FC = () => (
  <Card 
    className="border-0 shadow-sm rounded-xl"
    bodyStyle={{ padding: '32px' }}
  >
    <div className="mb-8">
      <h3  className="text-gray-800 font-bold text-lg mb-2">Vehicle Information</h3>
      <p className="text-gray-500">
        Details about your registered vehicle
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CarOutlined className="text-gray-400" />
            <p className="text-gray-600">Vehicle Make</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 text-base">Toyota</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-gray-600">Vehicle Model</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 text-base">Camry</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-gray-600">Vehicle Year</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 text-base">2020</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-gray-600">License Plate</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-gray-800 text-base font-mono">ABC 123</p>
              <Tag color="blue">Registered</Tag>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-gray-600">Vehicle Color</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 text-base">Silver</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-gray-600">Registration Status</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-gray-800">Active until Dec 31, 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Divider className="my-8" />
    
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
      <div className="flex items-start gap-3">
        <CarOutlined className="text-blue-500 text-lg mt-1" />
        <div>
          <p className="text-blue-800">Vehicle Update Required?</p>
          <p className="text-blue-600 block mt-1">
            For vehicle information updates, please contact our fleet management team 
            at fleet@example.com or visit the nearest service center.
          </p>
        </div>
      </div>
    </div>
  </Card>
);

// Add missing icon
const InfoCircleOutlined = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 1024 1024" fill="currentColor" className={className}>
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/>
    <path d="M512 336m-48 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0Z"/>
    <path d="M536 448h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z"/>
  </svg>
);

export { DriverAccountLayout, DriverProfile, DriverChangePassword, DriverVehicleInfo };