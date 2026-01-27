import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Form, Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import authService from '../../../services/authService';
import { useOnboardingStore } from '@/global/store';
import Images from "../../../components/images";
import { setNavData } from "../common/setNavData";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  user?: {
    id?: string;
    fullname?: string;
    email?: string;
    role?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    is_email_verified?: boolean;
    has_complete_profile?: boolean;
  };
  errors?: Record<string, string>;
  message?: string;
  msg?: string;
}

const Login: React.FC = () => {
  const navPath = useOnboardingStore();
  const { setNavPath } = navPath;
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const res: LoginResponse = await authService.login(values.email, values.password);

      // if (res?.msg) {
      //   toast.error(res.msg);
      //   return;
      // }

      if (res?.errors) {
        const errors = res.errors;
        Object.keys(errors).forEach(field => {
          toast.error(errors[field]);
        });
        return;
      }

      if (res?.token && res?.user) {
     

        setNavData(navPath, values.email, res);
        toast.success('Login Successful');
        
        // Navigate based on user role
        const role = res.user.role?.toLowerCase() || 'user';
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'driver' || role === 'rider') {
          navigate('/driver-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-start w-full">
      <Toaster />
      <Helmet>
        <meta charSet="utf-8" />
        <title>Delivery System: Login</title>
        <link rel="canonical" href={window.location.origin} />
      </Helmet>

      <div className="flex justify-center m-auto mb-6">
        <img src={Images.logodark} alt="Logo" className="h-10" />
      </div>
     
      <div className="mb-8 text-start">
        <h2 className="text-2xl font-bold text-[#475467] mb-1">Welcome Back</h2>
        <p className="text-sm font-medium text-[#667085]">
          Kindly input your details to login
        </p>
      </div>

      <Form<LoginFormValues>
        name="login"
        layout="vertical"
        onFinish={onFinish}
        className="w-full"
      >
        <Form.Item<LoginFormValues>
          label="Email Address"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input 
            placeholder="johndoe@xyz.com" 
            className="h-[42px] border-[#D0D5DD]"
            type="email" 
          />
        </Form.Item>

        <Form.Item<LoginFormValues>
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            placeholder="Enter your password"
            className="h-[42px]"
            iconRender={(visible: boolean) => 
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <div className="flex justify-end -mt-4 mb-2">
          <Link 
            to="/forgot-password" 
            onClick={() => { setNavPath("forgot-password"); }}
            className="text-[14px] text-[#FF6C2D] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-[46px]! mt-3 rounded-lg bg-[#FF6C2D] border-[#FF6C2D] font-medium text-lg hover:bg-[#FF6C2D]/90 transition"
          >
            Login
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center w-full mt-4">
        <span className="text-[#667085]">Don't have an account? </span>
        <Link 
          to="/register" 
          onClick={() => { setNavPath("register"); }}
          className="text-[14px] text-[#FF6C2D] hover:underline"
        >
          Register here
        </Link>
      </div>
    </div>
  );
};

export default Login;