import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Avatar, message, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { CiEdit } from "react-icons/ci";
import { getUserProfile, updateUserProfile } from '@/services/userService';
import toast from 'react-hot-toast';

const { Option } = Select;

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender?: 'male' | 'female' | 'other';
}

const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch user profile data
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      
      if (response.success && response.data) {
        setUserProfile(response.data);
        form.setFieldsValue(response.data);
      } else {
        message.error(response.message || 'Failed to fetch profile data');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      message.error(error.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    if (userProfile) {
      form.setFieldsValue(userProfile);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response = await updateUserProfile({ _id: userProfile?._id || '', ...values });
      
      if (response.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        fetchUserProfile();
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="md:p-4 p-0">
<div className='w-full h-[124px] bg-gradient-to-r from-green-50 to-green-100 rounded-md'></div>      
      <div className="flex w-[80%] mx-auto items-center mb-6 mt-[-40px]">
        <Avatar
          size={100}
          className="border-4 border-white shadow-lg bg-blue-100 mr-4"
          icon={<UserOutlined className="text-blue-500" />}
        >
          {userProfile?.firstName?.[0]?.toUpperCase()}
        </Avatar>
        <div className='ml-3'>
          <h3 className="text-xl font-semibold text-[#344054]">
            {userProfile?.firstName} {userProfile?.lastName}
          </h3>
          <p className="text-[#667085]">{userProfile?.email}</p>
        </div>
      </div>

      <div className='p-5 pt-0'>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="font-semibold mb-1 text-[#344054] text-lg">Profile Information</h4>
          </div>            
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="text-[#667085] flex items-center bg-[#E5E9F0] rounded-sm font-medium px-4 py-2 cursor-pointer hover:bg-[#D1D5DB] transition-colors"
            >
              <CiEdit className='text-[#667085] mr-2'/> Edit Profile
            </button>
          )}
        </div>

        <div className='mt-6 border-t border-[#E5E9F0] py-7'>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6 mb-9">
              <Form.Item 
                label="First Name" 
                name="firstName"
                rules={[{ required: true }]}
              >
                <Input 
                  placeholder="First name" 
                  className='!h-[42px]' 
                  disabled={!isEditing}
                />
              </Form.Item>
              
              <Form.Item 
                label="Last Name" 
                name="lastName"
                rules={[{ required: true }]}
              >
                <Input 
                  placeholder="Last name" 
                  className='!h-[42px]' 
                  disabled={!isEditing}
                />
              </Form.Item>
              
              <Form.Item 
                label="Email" 
                name="email"
              >
                <Input 
                  disabled 
                  className='!h-[42px]' 
                  suffix={<span className="text-orange-500 text-xs">Cannot be changed</span>}
                />
              </Form.Item>
              
              <Form.Item 
                label="Phone Number" 
                name="phoneNumber"
                rules={[{ required: true }]}
              >
                <Input 
                  placeholder="Phone number" 
                  className='!h-[42px]' 
                  disabled={!isEditing}
                />
              </Form.Item>
              
              <Form.Item 
                label="Gender" 
                name="gender"
              >
                <Select 
                  placeholder="Select gender" 
                  className='!h-[42px]' 
                  disabled={!isEditing}
                >
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </div>

            {isEditing && (
              <div className="border-t border-gray-200 py-7 flex justify-end gap-3">
                <Button 
                  onClick={handleCancel}
                  className="h-[46px] px-10"
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  className="h-[46px] px-10 bg-[#FF6C2D] hover:bg-orange-700"
                >
                  Save changes
                </Button>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Profile;