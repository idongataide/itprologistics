import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { changePassword } from '@/services/userService';

const { Title, Text } = Typography;

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // Call user service with correct field names
      const response = await changePassword({
        old_password: values.old_password, // Changed from currentPassword
        new_password: values.new_password  // Changed from newPassword
      });
      
      if (response.success) {
        toast.success('Password updated successfully');
        form.resetFields();
      } else {
        toast.error(response.message || 'Failed to update password');
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Toaster />
        
        <div className="mb-8 text-center">          
          <Title level={3} className="mt-4 mb-2">Change Password</Title>
          <Text type="secondary">Enter your current password to set a new one</Text>
        </div>

        <Card className="shadow-lg rounded-xl p-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
          >
            <Form.Item 
              label="Current Password" 
              name="old_password" // Changed from currentPassword
              rules={[{ required: true, message: 'Please enter your current password' }]}
            >
              <Input.Password 
                placeholder="Enter current password" 
                className="h-12"
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Form.Item 
                label="New Password" 
                name="new_password" // Changed from newPassword
                rules={[
                  { required: true, message: 'Please enter new password' },
                  { min: 6, message: 'Minimum 6 characters' },
                  { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
                    message: 'Include uppercase, lowercase & number' }
                ]}
                help="At least 6 characters with uppercase, lowercase & number"
              >
                <Input.Password 
                  placeholder="Enter new password" 
                  className="h-12"
                />
              </Form.Item>

              <Form.Item 
                label="Confirm New Password" 
                name="confirm_password"
                dependencies={['new_password']}
                rules={[
                  { required: true, message: 'Please confirm new password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  placeholder="Confirm new password" 
                  className="h-12"
                />
              </Form.Item>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Text className="text-blue-700 text-sm">
                  <strong>Password Requirements:</strong>
                  <ul className="mt-1 ml-4 list-disc">
                    <li>At least 6 characters long</li>
                    <li>Contains at least one uppercase letter</li>
                    <li>Contains at least one lowercase letter</li>
                    <li>Contains at least one number</li>
                  </ul>
                </Text>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size="large"
                  className="h-12 px-10 bg-[#FF6C2D] hover:bg-orange-700 border-none"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;