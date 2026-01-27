import React, { useState } from 'react';
import { Form, Input, Button, Select } from 'antd';
import Images from '@/components/images';
import { CiEdit } from "react-icons/ci";
import { useAdminProfile } from '@/hooks/useAdmin';
import { updateProfile } from '@/api/settingsApi';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const { data: adminProfile, mutate } = useAdminProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  React.useEffect(() => {
    if (adminProfile) {
      form.setFieldsValue({
        firstName: adminProfile?.first_name,
        lastName: adminProfile?.last_name,
        phoneNumber: adminProfile?.phone_number,
        emailAddress: adminProfile?.email,
        command: adminProfile?.command
      });
    }
  }, [adminProfile, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response = await updateProfile({
        first_name: values.firstName,
        last_name: values.lastName,
        phone_number: values.phoneNumber
      });

      
      if (response.status === 'ok') {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        mutate(); // Refresh the profile data
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:p-4 p-0">
      <div className='w-full h-[124px] bg-[#FFF0EA] rounded-md'></div>
      
      <div className="flex w-[80%] mx-auto items-center mb-6 mt-[-40px]">
        <div className="mr-2">
          <img
            src={adminProfile?.avatar || Images.profile}
            alt="Profile"
            className="w-30 h-30 rounded-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#344054] mt-5">
            {adminProfile?.first_name} {adminProfile?.last_name}
          </h3>
          <p className="text-[#667085]">{adminProfile?.email}</p>
        </div>
      </div>

      <div className='p-5 pt-0'>
        <div className="flex justify-between items-center">
          <div className=''>
            <h4 className="font-semibold mb-1 text-[#344054]">Profile Information</h4>
            {/* <p className="text-[#667085]">Lorem ipsum dolour of the dorlor rolor</p> */}
          </div>            
          {!isEditing && (
            <span 
              onClick={handleEdit}
              className="text-[#667085] flex items-center bg-[#E5E9F0] rounded-sm whitespace-nowrap text-nowrap font-medium px-4 py-1 cursor-pointer hover:bg-[#D1D5DB]"
            >
              <CiEdit className='text-[#667085] mr-2'/> Edit
            </span>
          )}
        </div>

        <div className='mt-10 border-t border-[#E5E9F0] py-7'>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mb-9">
              <Form.Item 
                label="First name" 
                name="firstName"
                rules={[{ required: true, message: 'Please input your first name!' }]}
              >
                <Input 
                  placeholder="First name" 
                  className='bg-[#F9FAFB] !h-[42px] capitalize' 
                  disabled={!isEditing}
                />
              </Form.Item>
              <Form.Item 
                label="Last name" 
                name="lastName"
                rules={[{ required: true, message: 'Please input your last name!' }]}
              >
                <Input 
                  placeholder="Last name" 
                  className='bg-[#F9FAFB] !h-[42px] capitalize' 
                  disabled={!isEditing}
                />
              </Form.Item>
              <Form.Item 
                label="Phone number" 
                name="phoneNumber"
                rules={[{ required: true, message: 'Please input your phone number!' }]}
              >
                <Input 
                  placeholder="Phone number" 
                  className='bg-[#F9FAFB] !h-[42px] capitalize' 
                  disabled={!isEditing}
                />
              </Form.Item>
              <Form.Item label="Email Address" name="emailAddress">
                <Input placeholder="Email address" className='bg-[#F9FAFB] !h-[42px]' disabled />
              </Form.Item>
              <Form.Item label="Zonal Office" name="command">
                <Input placeholder="Zonal Office" className='bg-[#F9FAFB] !h-[42px] capitalize' disabled />
              </Form.Item>
              <Form.Item label="Gender" name="Gender">
                <Select className='!h-[42px]' placeholder="Select">
                  <Select.Option value="">Male</Select.Option>
                  <Select.Option value="">Female</Select.Option>
                
                </Select>
              </Form.Item>
            </div>

            <div className="border-t border-gray-200 py-7 flex justify-end gap-3">
              {isEditing && (
                <Button 
                  onClick={handleCancel}
                  className="rounded-md h-[46px]! px-10 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                disabled={!isEditing}
                className="rounded-md h-[46px]! px-10 border border-transparent bg-[#FF6C2D] py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Save changes
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Profile;