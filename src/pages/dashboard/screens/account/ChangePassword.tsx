import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { updatePassword } from '@/api/settingsApi';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import Images from '@/components/images';

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const response = await updatePassword({
        old_password: values.currentPassword,
        new_password: values.newPassword
      });

      if (response.status === 'ok') {
        toast.success('Password updated successfully');
        form.resetFields();
      }
      else {
        const x = response?.response?.data?.msg
        toast.error(x);
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:p-4 p-0 mx-auto max-w-xl">
      <Toaster />
      <div className='md:p-4 p-0 pt-0'>
        <div className=" items-center">
          <div className="mb-5">
            <img src={Images.password} alt="Booking Banner" className="w-full h-full object-cover" />    
          </div>
          <div className=''>
            <h4 className="font-semibold mb-1 text-[#344054]">Change Password</h4>
            <p className="text-[#667085]">Kindly enter your current password to change your password</p>
          </div>            
          
        </div>

        <div className='mt-10 border-t border-[#E5E9F0] py-7 '>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <div className="grid grid-cols-1 gap-x-5 mb-9">
              <Form.Item 
                label="Current Password" 
                name="currentPassword"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password placeholder="Enter current password" />
              </Form.Item>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-5 mb-9'>
                <Form.Item 
                  label="New Password" 
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Please input your new password!' },
                    { min: 8, message: 'Password must be at least 8 characters long!' }
                  ]}
                >
                  <Input.Password placeholder="Enter new password" />
                </Form.Item>

                <Form.Item 
                  label="Confirm New Password" 
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm your new password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm new password" />
                </Form.Item>
              </div>
            </div>

            <div className="border-t border-gray-200 py-7 flex justify-end gap-3">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="rounded-md h-[46px]! px-10 border border-transparent bg-[#FF6C2D] py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Update Password
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;