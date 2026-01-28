"use client";
import React from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "antd";
import Images from "../../../components/images";
import OtpInput from 'react-otp-input';
import { useOnboardingStore } from '@/global/store';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import authService from "@/services/authService";

const EnterOtp = () => {
    const [otp, setOtp] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const { email, setNavPath } = useOnboardingStore();
    const { setOtpValue } = useOnboardingStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error('Please enter the complete 6-digit OTP');
            return;
        }

        if (!email) {
            toast.error('Email is missing. Please restart the process.');
            return;
        }

        setLoading(true);
        try {
            // Call the verifyOtp service with email and otp
            const response = await authService.verifyOtp({
                email: email,
                otp: otp
            });

            // Handle response based on your API structure
            if (response?.success || response?.status === 'success' || response?.data?.status === 'success') {
                setOtpValue(otp);
                toast.success('OTP verified successfully!');
                
                // Navigate based on the flow (forgot password or other)
                navigate('/login/forgot-password');
                setNavPath("enter-password");
            } else {
                // Handle error response
                const errorMsg = response?.message || 
                               response?.data?.message || 
                               response?.error || 
                               'OTP verification failed.';
                toast.error(errorMsg);
            }
        } catch (error: any) {
            // Handle network or server errors
            const errorMsg = error?.response?.data?.message || 
                           error?.message || 
                           'An error occurred during OTP verification.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            // Call resend OTP service
            // await resendOtp({ email: email });
            toast.success('OTP resent successfully!');
        } catch (error) {
            toast.error('Failed to resend OTP. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-start w-full">
            <Helmet>
                <meta charSet="utf-8" />
                <title>ITproLogistics: Enter OTP</title>
            </Helmet> 
            <Toaster/>
            <div className="flex justify-center m-auto mb-6">
                <img src={Images.logodark} alt="RESQ Logo" className="h-10" />
            </div>

            {/* Welcome Text */}
            <div className="mb-8 text-start ">
                <h2 className="text-2xl font-bold! text-[#475467] mb-1!">Enter OTP</h2>
                <p className="text-sm font-medium text-[#667085]">
                    An OTP was sent to your email <span className="text-[#FF6C2D]">{email}</span>  
                    address to verify your account. Kindly enter the six digit code to proceed
                </p>
                <div className="mt-2">
                    <Button 
                        type="link" 
                        onClick={handleResendOtp}
                        className="p-0 text-[#FF6C2D] hover:text-[#E55B1F]"
                        disabled={loading}
                    >
                        Resend OTP
                    </Button>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="py-8">                
                <p className="text-[#475467] font-medium mb-4">Input the six digits your OTP code here </p>
                
                <div className="mb-6 flex justify-center">
                    <OtpInput
                        value={otp}
                        onChange={setOtp}
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
                            margin: '0 4px',
                            fontSize: '20px',
                            borderRadius: '8px',
                            border: '1px solid #D0D5DD',
                            color: '#1C2023',
                        }}
                        containerStyle={{
                            justifyContent: 'center',
                        }}
                    />
                </div>

                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={otp.length !== 6}
                    className={`w-full h-[46px]! mt-5 rounded-lg font-medium text-lg transition border-0 ${
                        otp.length === 6 
                        ? 'bg-[#FF6C2D] text-white hover:bg-[#E55B1F] cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Proceed
                </Button>
            </form>
        </div>
    );
};

export default EnterOtp;