import React, { useState, useEffect } from 'react';
import { Card, Tag, Divider, Spin, Avatar } from 'antd';
import {
  UserOutlined,
  CarOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Outlet, NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDriverProfile } from '@/services/driverService';

interface DriverProfileData {
  _id: string;
  fullname: string;
  email: string;
  phone: string;
  driverId: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  isVerified: boolean;
  createdAt: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
  };
}

const DriverAccountLayout: React.FC = () => {
  const [profile, setProfile] = useState<DriverProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  const fetchDriverProfile = async () => {
    try {
      setLoading(true);
      const response = await getDriverProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        toast.error(response.message || 'Failed to load profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading account..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">         
          <div>
            <h3 className="text-gray-800 text-2xl font-bold">Account Management</h3>
            <p className="text-gray-600">View and manage your driver account information</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation with Profile Summary */}
          <div className="lg:w-1/4">
            <Card className="border-0 shadow-sm rounded-xl mb-6">
              {profile && (
                <div className="text-center">
                  <Avatar 
                    size={80} 
                    icon={<UserOutlined />}
                    className="mb-4 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-600"
                  />
                  <h3 className="font-semibold text-gray-800 text-lg">{profile.fullname}</h3>
                  <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
                  <Tag 
                    color={profile.status === 'active' ? 'green' : 
                           profile.status === 'pending' ? 'orange' : 'red'} 
                    className="mt-3"
                  >
                    {profile.status.toUpperCase()}
                  </Tag>
                </div>
              )}
            </Card>

            <Card 
              className="border-0 shadow-sm rounded-xl"
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
          
            </Card>
          </div>

          {/* Account Content */}
          <div className="lg:w-3/4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

const DriverProfile: React.FC = () => {
  const [profile, setProfile] = useState<DriverProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  const fetchDriverProfile = async () => {
    try {
      setLoading(true);
      const response = await getDriverProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        toast.error(response.message || 'Failed to load profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm rounded-xl min-h-[400px] flex items-center justify-center">
        <Spin size="large" tip="Loading profile..." />
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm rounded-xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-gray-800 font-bold text-lg mb-2">Profile Information</h3>
          <p className="text-gray-500">Your personal and account details</p>
        </div>        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserOutlined className="text-gray-400" />
              <p className="text-gray-600">Full Name</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-800 text-base">{profile?.fullname || 'Not available'}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MailOutlined className="text-gray-400" />
              <p className="text-gray-600">Email Address</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-800 text-base">{profile?.email || 'Not available'}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <PhoneOutlined className="text-gray-400" />
              <p className="text-gray-600">Phone Number</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-800 text-base">{profile?.phone || 'Not available'}</p>
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
                <p className="text-gray-800 text-base font-mono">{profile?.driverId || 'Not assigned'}</p>
                <Tag color={profile?.status === 'active' ? 'green' : 
                           profile?.status === 'pending' ? 'orange' : 'red'}>
                  {profile?.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Unknown'}
                </Tag>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <SafetyCertificateOutlined className="text-gray-400" />
              <p className="text-gray-600">Verification Status</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${profile?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <p className="text-gray-800">
                  {profile?.isVerified ? 'Verified Driver' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarOutlined className="text-gray-400" />
              <p className="text-gray-600">Member Since</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-800">{profile?.createdAt ? formatDate(profile.createdAt) : 'Not available'}</p>
            </div>
          </div>
        </div>
      </div>

      <Divider className="my-8" />
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 1024 1024" fill="#1890ff" className="mt-1">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/>
            <path d="M512 336m-48 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0Z"/>
            <path d="M536 448h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z"/>
          </svg>
          <div>
            <p className="text-blue-800 font-medium">Need to update your information?</p>
            <p className="text-blue-600 block mt-1">
              Contact support at support@yourcompany.com or call our driver support hotline.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const DriverChangePassword: React.FC = () => {
  // This component remains the same as before, but using driver-specific service
  return (
    <Card 
      className="border-0 shadow-sm rounded-xl"
      bodyStyle={{ padding: '32px' }}
    >
      <div className="mb-8">
        <h3 className="text-gray-800 font-bold text-lg mb-2">Password & Security</h3>
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
};

const DriverVehicleInfo: React.FC = () => {
  const [profile, setProfile] = useState<DriverProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  const fetchDriverProfile = async () => {
    try {
      setLoading(true);
      const response = await getDriverProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        toast.error(response.message || 'Failed to load vehicle info');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error loading vehicle information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm rounded-xl min-h-[400px] flex items-center justify-center">
        <Spin size="large" tip="Loading vehicle info..." />
      </Card>
    );
  }

  return (
    <Card 
      className="border-0 shadow-sm rounded-xl"
      bodyStyle={{ padding: '32px' }}
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-gray-800 font-bold text-lg mb-2">Vehicle Information</h3>
          <p className="text-gray-500">
            Details about your registered vehicle
          </p>
        </div>       
      </div>

      {profile?.vehicle && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CarOutlined className="text-gray-400" />
                <p className="text-gray-600">Vehicle Make</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-800 text-base">{profile.vehicle.make || 'Not specified'}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-600">Vehicle Model</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-800 text-base">{profile.vehicle.model || 'Not specified'}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-600">Vehicle Year</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-800 text-base">{profile.vehicle.year || 'Not specified'}</p>
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
                  <p className="text-gray-800 text-base font-mono">{profile.vehicle.licensePlate || 'Not registered'}</p>
                  <Tag color="blue">Registered</Tag>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-600">Vehicle Color</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-800 text-base">{profile.vehicle.color || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      ) }

      <Divider className="my-8" />
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <CarOutlined className="text-blue-500 text-lg mt-1" />
          <div>
            <p className="text-blue-800 font-medium">Vehicle Update Required?</p>
            <p className="text-blue-600 block mt-1">
              For vehicle information updates, please contact our fleet management team 
              at fleet@example.com or visit the nearest service center.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export { DriverAccountLayout, DriverProfile, DriverChangePassword, DriverVehicleInfo };