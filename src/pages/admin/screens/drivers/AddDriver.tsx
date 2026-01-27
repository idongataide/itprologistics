import React, { useState } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Steps,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import driverService from '@/services/admin/driverService';

const { Title, Text } = Typography;
const { Step } = Steps;

interface CreateDriverData {
  fullname: string;
  email: string;
  phone: string;
  password: string;
}

const AddDriver: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [createdDriverId, setCreatedDriverId] = useState<string | null>(null);
  const [step, setStep] = useState<number>(0);

  const onFinish = async (values: CreateDriverData) => {
    setLoading(true);
    try {
      // Use the new createDriverAccount function instead
      const response = await driverService.createDriverAccount({
        ...values,
        role: 'driver'
      });
  
      message.success('Driver account created successfully!');
      form.resetFields();
      
      // Store the created driver ID for adding details later
      if (response.user && response.user.id) {
        setCreatedDriverId(response.user.id);
        setStep(1);
        message.info('Now you can add driver details like license and address.');
      }
      
    } catch (error: any) {
      console.error('Create driver error:', error);
      message.error(error.message || 'Failed to create driver account');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriverDetails = () => {
    if (createdDriverId) {
      // Navigate to driver details page
      navigate(`/admin/drivers/${createdDriverId}/add-details`);
    }
  };

  const handleSkipForNow = () => {
    message.success('Driver account created. You can add details later.');
    navigate('/admin/drivers');
  };

  const steps = [
    {
      title: 'Create Account',
      content: (
        <Form
          form={form}
          name="add_driver"
          layout="vertical"
          onFinish={onFinish}
        >
          <Title level={4} className="text-gray-700 mb-6">Basic Information</Title>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fullname"
                label="Full Name"
                rules={[{ required: true, message: 'Please input full name!' }]}
              >
                <Input 
                  prefix={<UserOutlined className="text-gray-400" />} 
                  placeholder="John Doe" 
                  size="large" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please input email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined className="text-gray-400" />} 
                  placeholder="john@example.com" 
                  size="large" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please input phone number!' }]}
              >
                <Input 
                  prefix={<PhoneOutlined className="text-gray-400" />} 
                  placeholder="+1 234 567 8900" 
                  size="large" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please input password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password 
                  placeholder="Create password (min. 6 characters)" 
                  size="large" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mt-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/admin/drivers" className="w-full sm:w-auto">
                <Button 
                  size="large" 
                  className="h-12 w-full sm:w-auto flex items-center justify-center"
                  icon={<ArrowLeftOutlined />}
                >
                  Back to Drivers
                </Button>
              </Link>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="h-12 w-full sm:w-auto"
              >
                Create Driver Account
              </Button>
            </div>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: 'Add Details',
      content: (
        <div className="text-center py-8">
          <div className="mb-6">
            <CheckCircleOutlined className="text-green-500 text-5xl mb-4" />
            <Title level={3} className="text-gray-800">Account Created Successfully!</Title>
            <Text className="text-gray-600">
              Driver account has been created. Now you can add driver details like license number and address.
            </Text>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="primary"
              size="large"
              onClick={handleAddDriverDetails}
              className="h-12 px-8"
            >
              Add Driver Details Now
            </Button>
            <Button
              size="large"
              onClick={handleSkipForNow}
              className="h-12 px-8"
            >
              Skip for Now
            </Button>
          </div>
          
          <div className="mt-8">
            <Link to="/admin/drivers">
              <Button type="link">Return to Drivers List</Button>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/admin/drivers" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeftOutlined className="mr-2" />
            Back to Drivers
          </Link>
          <Title level={2} className="text-gray-800">Add New Driver</Title>
          <Text className="text-gray-600">Create a new driver account with basic information</Text>
        </div>

        <Card className="border-0 shadow-sm rounded-2xl">
          <div className="mb-6">
            <Steps current={step} size="small">
              <Step title="Create Account" />
              <Step title="Add Details" />
            </Steps>
          </div>
          
          {steps[step].content}
        </Card>
      </div>
    </div>
  );
};

export default AddDriver;