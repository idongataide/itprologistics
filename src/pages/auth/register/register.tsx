import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Form, Input, Button, Select, Row, Col } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import authService from '../../../services/authService';
import { useOnboardingStore } from '@/global/store';
import Images from '@/components/images.tsx';

const { Option } = Select;

interface RegisterFormValues {
  name: string;
  email: string;
  phone: string;
  userType: 'user' | 'rider' | 'admin';
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  token?: string;
  errors?: Record<string, string>;
  message?: string;
  msg?: string;
}

const Register: React.FC = () => {
  const { setNavPath } = useOnboardingStore();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const onFinish = async (values: RegisterFormValues) => {
    if (values.password !== values.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const role = values.userType === 'rider' ? 'driver' : values.userType;

    try {
      const res: RegisterResponse = await authService.register(
        values.name,
        values.email,
        values.phone,
        values.password,
        role
      );

      if (res?.errors) {
        const errors = res.errors;
        Object.keys(errors).forEach(field => {
          toast.error(errors[field]);
        });
        return;
      }

      
      if (res?.msg) {
        toast.error(res.msg);
        return;
      }

    
      if (res?.token) {
        toast.success('Registration Successful');
        navigate('/register');
        setNavPath('success');
      } else {
        toast.error(res.message || 'Registration faileds');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start w-full">
      <Toaster />
      <Helmet>
        <meta charSet="utf-8" />
        <title>Delivery System: Register</title>
        <link rel="canonical" href={window.location.origin} />
      </Helmet>

      <div className="flex justify-center m-auto mb-6">
        <img src={Images.logodark} alt="Logo" className="h-10" />
      </div>
      
      <div className="mb-8 text-start w-full">
        <h2 className="text-2xl font-bold text-[#475467] mb-1">Create Account</h2>
        <p className="text-sm font-medium text-[#667085]">
          Kindly input your details to register
        </p>
      </div>

      <Form
        name="register"
        layout="vertical"
        onFinish={onFinish}
        className="w-full"
      >
        <Form.Item
          label="Full Name"
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input 
            placeholder="John Doe" 
            className="h-[42px] border-[#D0D5DD]"
          />
        </Form.Item>
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input 
            placeholder="johndoe@xyz.com" 
            className="h-[42px] border-[#D0D5DD] w-full"
            type="email"
          />
        </Form.Item>

        {/* Responsive Row for Email and Phone */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[{ required: true, message: 'Please input your number!' }]}
            >
              <Input 
                placeholder="+234 904 5627 890" 
                className="h-[42px] border-[#D0D5DD] w-full"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="User Type"
              name="userType"
              rules={[{ required: true, message: 'Please select user type!' }]}
            >
              <Select 
                placeholder="Select user type" 
                className="h-[42px]! border-[#D0D5DD]"
              >
                <Option value="user">User</Option>
                {/* <Option value="rider">Rider</Option> */}
              </Select>
            </Form.Item>
          </Col>         
        </Row>

        {/* Responsive Row for Password and Confirm Password */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                placeholder="Create a password"
                className="h-[42px] w-full"
                iconRender={(visible: boolean) => 
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              rules={[{ required: true, message: 'Please confirm your password!' }]}
            >
              <Input.Password
                placeholder="Confirm your password"
                className="h-[42px] w-full"
                iconRender={(visible: boolean) => 
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-[46px]! mt-3 rounded-lg bg-[#FF6C2D] border-[#FF6C2D] font-medium text-lg hover:bg-[#FF6C2D]/90 transition"
          >
            Register
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center w-full mt-4">
        <span className="text-[#667085]">Already have an account? </span>
        <Link 
          to="/login" 
          onClick={() => { setNavPath("login"); }}
          className="text-[14px] text-[#FF6C2D] hover:underline"
        >
          Login here
        </Link>
      </div>
    </div>
  );
};

export default Register;