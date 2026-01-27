import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Images from "../components/images";


interface Props {
    children?: ReactNode;
}

const OnboardingLayout: React.FC<Props> = ({ children }) => {
    return (
        <main className="bg-[#f2f6f8] min-h-screen w-[100%]">
            <div className="flex  lg:w-full w-full min-h-screen">
                {/* Left image side */}
                <div className="hidden lg:block lg:w-[55%] min-h-screen overflow-hidden" 
                     style={{ 
                         backgroundImage: `url(${Images.authbg})`, 
                         backgroundSize: 'cover', 
                         backgroundPosition: 'center' 
                     }}>
                     <div className="flex flex-col justify-between h-full p-8">
                        <div className="text-white text-2xl font-bold"></div>
                        <div className="flex gap-6">
                        <div className="backdrop-blur-lg bg-[fff] bg-opacity-40 flex items-center min-h-[200px]  rounded-xl p-6 w-1/2 text-white gap-2">
                            <div className="">
                                <div className="w-9 h-9 bg-[#F9FAFB] rounded-full mb-5"></div>
                                    <div className="text-[19px] font-medium">Streamlined logistics accross the area</div>
                                </div>
                            </div>
                            <div className="backdrop-blur-lg  flex items-center bg-[fff] bg-opacity-40  min-h-[200px]  rounded-xl p-6 w-1/2 text-white gap-2">
                                <div className="">
                                     <div className="w-9 h-9 bg-[#F9FAFB] rounded-full mb-5 "></div>
                                     <div className="text-[19px] font-medium">Reliable support to get you out of uncomfortable situations</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Right side for children (login form, etc.) */}
                <div className="lg:w-[45%]  min-h-screen w-full flex items-center justify-center bg-white">
                    <div className="w-full max-w-md p-8">
                        {children ? children : <Outlet />}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default OnboardingLayout;