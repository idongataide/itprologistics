import React, { useState } from 'react';
import { Button, Form } from 'antd';
import { contactSupport } from '@/api/settingsApi'; // You'll need to create this API
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import Images from '@/components/images';
import TextArea from 'antd/es/input/TextArea';

const AccountSupport: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // Call the support API
      const response = await contactSupport({
        message: values.message,
      });

      if (response?.status === 'ok' || response?.success) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        form.resetFields();
      } else {
        const errorMessage = response?.response?.data?.msg || 'Failed to send message';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mx-auto max-w-xl">
      <Toaster />
      <div className='p-5 pt-0'>
        <div className="items-center">
          <div className="mb-5">
            <img src={Images.support} alt="Support Banner" className="w-full h-full object-cover" />    
          </div>
          <div className='mb-6'>
            <h4 className="font-semibold mb-1 text-[#344054]">Support</h4>
            <p className="text-[#344054]">
              Having any challenges? Contact us now and we'll be happy to help.
            </p>
          </div>   
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >         

            <Form.Item
              name="message"
              label={<span className="text-[#344054] font-medium">Message</span>}
              rules={[
                { required: true, message: 'Please enter your message' },
                { min: 10, message: 'Message must be at least 10 characters' }
              ]}
            >
              <TextArea
                placeholder="Please describe your issue or question in detail..."
                rows={16}
                className="rounded-md min-h-[100px] border-[#D0D5DD] resize-none"
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary"
                htmlType="submit"
                loading={loading}
                className="rounded-md w-[100%]! mt-4 h-[46px]! px-10 border border-transparent bg-[#FF6C2D]! py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Send Message
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AccountSupport;