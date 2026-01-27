"use client";
import { Helmet } from "react-helmet-async";
import { Button } from "antd";
import Images from "../../../components/images";
import { useNavigate } from "react-router-dom";
    

const Success = () => {
    const navigate = useNavigate();
    const onFinish = () => {
        navigate("/login");
    };

   
    return (
        <div className="flex flex-col items-center w-full">
            <Helmet>
                <meta charSet="utf-8" />
                <title>RESQ: Password Reset Success</title>
                <link rel="canonical" href={`${URL}`} />
            </Helmet>
            {/* Logo */}
            <div className="flex justify-center m-auto mb-1">
                <img src={Images.success} alt="Ion" className="h-30" />
            </div>
            {/* Welcome Text */}
            <div className="text-center ">
                <h2 className="text-2xl font-bold! text-[#475467] mb-1!">Success</h2>
                <p className="text-md font-medium text-[#667085]">Your account has been created <br/> successfully</p>
            </div>
           
            <Button
                type="primary"
                htmlType="submit"
                onClick={onFinish}
                className="w-[70%]! h-[46px]! mt-3! mb-0!  rounded-lg bg-[#FF6C2D] text-[#FF6C2D] font-medium text-lg hover:bg-gray-300 transition border-0"
            >
                Login
            </Button>
                
        </div>
    )
}
    

export default Success;