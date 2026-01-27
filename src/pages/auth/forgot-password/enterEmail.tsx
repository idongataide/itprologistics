"use client";
import React from "react";
import { Helmet } from "react-helmet-async";
import { Form, Input, Button } from "antd";
import Images from "../../../components/images";
import { Link, useNavigate } from "react-router-dom";
import { changePassword } from "@/api/authAPI";
import toast from "react-hot-toast";
import { useOnboardingStore } from "@/global/store";
import { sendOtp } from "@/api/otpApi";


const EnterEmail = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const { setEmail, setOtpRequestId, setNavPath } = useOnboardingStore();
    
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await changePassword({ email: values.email });
            if (response?.error || response?.status === 'error' || response?.response?.data?.status === 'error') {
                toast.error(response?.response?.data?.msg || response?.msg || 'Failed to send OTP. Please try again.');
            } else {
                setEmail(values.email);
                let otpRequestId = null;
                if (response?.data?.otp_request_id) {
                    otpRequestId = response.data.otp_request_id;
                    setOtpRequestId(otpRequestId);
                } else if (response?.otp_request_id) {
                    otpRequestId = response.otp_request_id;
                    setOtpRequestId(otpRequestId);
                }
                
                // Call sendOtp function
                if (otpRequestId) {
                    const otpData = {
                        otp_request_id: otpRequestId,
                        otp_mode: 'email'
                    };

                    sendOtp(otpData)
                        .then(otpRes => {
                            if(otpRes?.error) {
                                toast.error(otpRes.message || 'Failed to send OTP');
                            } else {
                                if (otpRes?.data?.otp_request_id) {
                                    setOtpRequestId(otpRes.data.otp_request_id);
                                }
                                toast.success('OTP sent successfully to your email!');
                                navigate('/login/forgot-password');
                                setNavPath("enter-otp");
                            }
                        })
                        .catch(otpError => {
                            toast.error(otpError.message || "An error occurred while sending OTP");
                        });
                } else {
                    toast.error('OTP request ID not found. Please try again.');
                }
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
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
            <div className="mb-8 text-start ">
                <h2 className="text-2xl font-bold! text-[#475467] mb-1!">Forgot password</h2>
                <p className="text-sm font-medium text-[#667085]">Please enter your email to request a password reset</p>
            </div>
            <Form
                name="login"
                layout="vertical"
                onFinish={onFinish}
                className="w-full"
            >
                <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!' }]}
                >
                    <Input placeholder="johndoe@xyz.com" className="h-[42px] border-[#D0D5DD]!" type="email" />
                </Form.Item>


                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full h-[46px]! mt-3!  rounded-lg bg-[#FF6C2D] text-[#FF6C2D] font-medium text-lg hover:bg-gray-300 transition border-0"
                    >
                        Send reset OTP
                    </Button>
                </Form.Item>

                <div className="flex justify-center mt-3 mb-2">
                    <Link to="/login" 
                     className="text-[14px] text-[#FF6C2D]! hover:underline">
                        Back to login
                    </Link>
                </div>
            </Form>
        </div>
    )
}
    

export default EnterEmail;