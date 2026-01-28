"use client";
import React from "react";
import { Helmet } from "react-helmet-async";
import { Form, Input, Button } from "antd";
import Images from "../../../components/images";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useOnboardingStore } from "@/global/store";
import authService  from "@/services/authService";

const EnterEmail = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const { setEmail, setNavPath } = useOnboardingStore();
    
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Call API to initiate password reset and send OTP
            const response = await authService.initiatePasswordReset({ email: values.email });
            
            // Handle response based on your API structure
            if (response?.success || response?.status === 'success' || response?.data?.status === 'success') {
                // Store email in state/context
                setEmail(values.email);
                
                // Show success message
                toast.success('OTP sent successfully to your email!');
                
                // Navigate to OTP verification page
                navigate('/login/forgot-password');
                setNavPath("enter-otp");
                
            } else {
                // Handle error response
                const errorMsg = response?.message || 
                               response?.data?.message || 
                               response?.response?.data?.message ||
                               'Failed to send OTP. Please try again.';
                toast.error(errorMsg);
            }
        } catch (error: any) {
            // Handle network or server errors
            const errorMsg = error?.response?.data?.message || 
                           error?.message || 
                           'An error occurred. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const validateEmail = (_: any, value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || emailRegex.test(value)) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('Please enter a valid email address'));
    };

    return (
        <div className="flex flex-col items-start w-full">
            <Helmet>
                <meta charSet="utf-8" />
                <title>RESQ: Forgot Password</title>
                <link rel="canonical" href={`${URL}`} />
            </Helmet> 
          
            <div className="flex justify-center m-auto mb-6">
                <img src={Images.logodark} alt="RESQ Logo" className="h-10" />
            </div>

            {/* Welcome Text */}
            <div className="mb-8 text-start">
                <h2 className="text-2xl font-bold! text-[#475467] mb-1!">Forgot Password</h2>
                <p className="text-sm font-medium text-[#667085]">
                    Please enter your email to request a password reset
                </p>
            </div>
            
            <Form
                name="forgot-password"
                layout="vertical"
                onFinish={onFinish}
                className="w-full"
                requiredMark={false}
            >
                <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { validator: validateEmail }
                    ]}
                    validateTrigger="onBlur"
                >
                    <Input 
                        placeholder="johndoe@xyz.com" 
                        className="h-[42px] border-[#D0D5DD]!" 
                        type="email"
                        size="large"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full h-[46px]! mt-3! rounded-lg bg-[#FF6C2D] hover:bg-[#E55B1F] text-white font-medium text-lg transition border-0"
                    >
                        Send Reset OTP
                    </Button>
                </Form.Item>

                <div className="flex justify-center mt-6 mb-2">
                    <Link 
                        to="/login" 
                        className="text-[14px] text-[#FF6C2D]! hover:underline font-medium"
                    >
                        ← Back to login
                    </Link>
                </div>
            </Form>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg w-full">
                <p className="text-sm text-[#475467] mb-1">
                    <strong>Note:</strong> 
                </p>
                <p className="text-xs text-[#667085]">
                    • You will receive a 6-digit OTP code to the email provided
                </p>
                <p className="text-xs text-[#667085]">
                    • The OTP is valid for 10 minutes
                </p>
                <p className="text-xs text-[#667085]">
                    • Check your spam folder if you don't see the email
                </p>
            </div>
        </div>
    );
};

export default EnterEmail;