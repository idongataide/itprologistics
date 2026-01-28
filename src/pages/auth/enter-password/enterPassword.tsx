"use client";
import React from "react";
import { Helmet } from "react-helmet-async";
import { Form, Input, Button } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import Images from "@/components/images";
import { useNavigate} from "react-router-dom";
import authService  from "@/services/authService";
import toast, { Toaster } from "react-hot-toast";
import { useOnboardingStore } from "@/global/store";

const EnterPassword = () => {
    const { email, otpValue, setOtpValue, setNavPath } = useOnboardingStore();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        // Client-side validation
        if (values.password !== values.confirmPassword) {
            form.setFields([
                {
                    name: 'confirmPassword',
                    errors: ['Passwords do not match'],
                },
            ]);
            return;
        }

        // Validate required fields
        if (!email || !otpValue) {
            toast.error('Missing required information. Please restart the password reset process.');
            return;
        }

        // Password strength validation
        const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordStrengthRegex.test(values.password)) {
            toast.error('Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                email: email,
                otp: otpValue,
                new_password: values.password,
                confirm_password: values.confirmPassword
            };
            
            const response = await authService.resetPassword(payload);
           
            if (response?.success || response?.status === 'success') {
                toast.success('Password reset successfully! You can now login with your new password.');
                setOtpValue(null);
                navigate('/login');
                setNavPath("login");
            } else {
                // Handle API error response
                const errorMsg = response?.message || 
                               response?.data?.message || 
                               response?.response?.data?.message ||
                               'Failed to reset password. Please try again.';
                toast.error(errorMsg);
            }
        } catch (error: any) {
            // Handle network/server errors
            const errorMsg = error?.response?.data?.message || 
                           error?.message || 
                           'An error occurred while resetting password.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToOtp = () => {
        navigate('/login/forgot-password');
        setNavPath("enter-otp");
    };

    return (
        <div className="flex flex-col items-start w-full max-w-md mx-auto">
            <Toaster />
            <Helmet>
                <meta charSet="utf-8" />
                <title>RESQ: Set New Password</title>
            </Helmet>
            
            <div className="flex justify-center m-auto mb-6">
                <img src={Images.logodark} alt="RESQ Logo" className="h-10" />
            </div>
            
            <div className="mb-8 text-start w-full">
                <h2 className="text-2xl font-bold! text-[#475467] mb-2!">Set New Password</h2>
                <p className="text-sm font-medium text-[#667085]">
                    Create a strong new password for your account
                </p>
                {email && (
                    <p className="text-xs text-[#667085] mt-1">
                        Account: <span className="text-[#FF6C2D] font-medium">{email}</span>
                    </p>
                )}
            </div>
            
            <Form
                form={form}
                name="resetPassword"
                layout="vertical"
                onFinish={onFinish}
                className="w-full"
                requiredMark={false}
            >
                <Form.Item
                    label="New Password"
                    name="password"
                    rules={[
                        { required: true, message: 'Please enter your new password!' },
                        { min: 8, message: 'Password must be at least 8 characters!' },
                        { 
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message: 'Must include uppercase, lowercase, number & special character'
                        }
                    ]}
                    hasFeedback
                    validateTrigger="onBlur"
                >
                    <Input.Password
                        placeholder="Enter new password"
                        className="h-[42px] border-[#D0D5DD]!"
                        iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Please confirm your password!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match!'));
                            },
                        }),
                    ]}
                    hasFeedback
                    validateTrigger="onBlur"
                >
                    <Input.Password
                        placeholder="Confirm new password"
                        className="h-[42px] border-[#D0D5DD]!"
                        iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        size="large"
                    />
                </Form.Item>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-[#475467] mb-2">Password Requirements:</p>
                    <ul className="text-xs text-[#667085] space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• One uppercase letter (A-Z)</li>
                        <li>• One lowercase letter (a-z)</li>
                        <li>• One number (0-9)</li>
                        <li>• One special character (!@#$%^&* etc.)</li>
                    </ul>
                </div>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full h-[46px]! rounded-lg bg-[#FF6C2D] hover:bg-[#E55B1F] text-white font-medium text-lg transition border-0"
                    >
                        Reset Password
                    </Button>
                </Form.Item>
            </Form>

            <div className="flex justify-between items-center w-full mt-6">
                <Button
                    type="link"
                    onClick={handleBackToOtp}
                    className="text-[#667085] hover:text-[#475467] p-0"
                    disabled={loading}
                >
                    ← Back to OTP
                </Button>
                
                <Button
                    type="link"
                    onClick={() => navigate('/login')}
                    className="text-[#FF6C2D] hover:text-[#E55B1F] p-0"
                >
                    Back to Login
                </Button>
            </div>
        </div>
    );
};

export default EnterPassword;