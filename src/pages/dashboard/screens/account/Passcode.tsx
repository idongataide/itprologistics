import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import OtpInput from 'react-otp-input';
import { set2FA } from '@/api/settingsApi';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

const Passcode: React.FC = () => {
  const [form] = Form.useForm();
  const [currentOtp, setCurrentOtp] = useState('');
  const [newOtp, setNewOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (currentOtp !== newOtp) {
      toast.error('Passcodes do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await set2FA({
        password: values.currentPassword,
        '2fa_code': currentOtp
      });

      if (response.status === 'ok') {
        toast.success('Passcode setup successfully');
        form.resetFields();
        setCurrentOtp('');
        setNewOtp('');
      } else {
        const errorMsg = response?.response?.data?.msg;
        toast.error(errorMsg || 'Failed to setup passcode');
      }
    } catch (error) {
      toast.error('Failed to setup passcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Toaster />
      <div className='p-5 pt-0'>
        <div className="flex justify-between items-center">
          <div className=''>
            <h4 className="font-semibold mb-1 text-[#344054]">Setup Passcode</h4>
            <p className="text-[#667085] text-[14px]">
              Create a passcode to authorize admin actions
            </p>
          </div>  
        </div>

        <div className='mt-10 border-t border-[#E5E9F0] py-7'>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <div className="grid grid-cols-1 gap-x-5 mb-9">
              <Form.Item 
                label="Current Password" 
                name="currentPassword"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password placeholder="Enter current password" />
              </Form.Item>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-5 mb-9'>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#344054] mb-2">
                    Passcode
                  </label>
                  <OtpInput
                    value={currentOtp}
                    onChange={setCurrentOtp}
                    numInputs={6}
                    renderInput={(props, index) => {
                      if (index === 2) {
                        return (
                          <span key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <input {...props} style={{ ...props.style }} />
                            <span className='mx-3 font-bold text-[#D0D5DD] text-3xl'> - </span>
                          </span>
                        );
                      }
                      return <input {...props} key={index} />;
                    }}
                    shouldAutoFocus
                    inputStyle={{
                      width: '48px',
                      height: '48px',
                      marginRight: '12px',
                      fontSize: '20px',
                      borderRadius: '8px',
                      border: '1px solid #D0D5DD',
                      color: '#1C2023',
                    }}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#344054] mb-2">
                    Confirm Passcode
                  </label>
                  <OtpInput
                    value={newOtp}
                    onChange={setNewOtp}
                    numInputs={6}
                    renderInput={(props, index) => {
                      if (index === 2) {
                        return (
                          <span key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <input {...props} style={{ ...props.style }} />
                            <span className='mx-3 font-bold text-[#D0D5DD] text-3xl'> - </span>
                          </span>
                        );
                      }
                      return <input {...props} key={index} />;
                    }}
                    shouldAutoFocus
                    inputStyle={{
                      width: '48px',
                      height: '48px',
                      marginRight: '12px',
                      fontSize: '20px',
                      borderRadius: '8px',
                      border: '1px solid #D0D5DD',
                      color: '#1C2023',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 py-7 flex justify-end gap-3">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="rounded-md h-[46px]! px-10 border border-transparent bg-[#FF6C2D] py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700"
              >
                Save Passcode
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Passcode;