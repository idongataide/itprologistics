import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useOnboardingStore } from "../../../global/store";
import { AiOutlineLogout } from "react-icons/ai";
import Images from "../../../components/images";



const SiderScreen: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { siderBarView, setSiderBarView } = useOnboardingStore();
  const data = useOnboardingStore()
  
  const navData = [
    {
      id: 1,
      title: "home",
      URL: "home",
      icon: Images.icon?.home,
    },
   
    {
      id: 3,
      title: "bookings",
      URL: "bookings",
      icon: Images.icon?.bookings,
    },  
    {
      id: 8,
      title: "Account",
      URL: "account",
      icon: Images.icon?.setup,
    },

  ];

  const handleStart = pathname.split("/")[1] === "" ? true : false;
  
  const [timeChange, setTimeChange] = useState<boolean>(false);

  const speedHandling = siderBarView ? 300 : 160;

  const timeDelay = setTimeout(() => {
    setTimeChange(siderBarView);

    // clear and clean memory
    return () => {
      clearTimeout(timeDelay);
    };
  }, speedHandling);

  return (
    <div className="w-full relative h-full  bg-[] flex flex-col ">
      <div
        className="absolute -right-3 top-7 cursor-pointer text-gray-500 hidden md:block"
        onClick={() => {
          setSiderBarView(!siderBarView);
        }}
      >
        <img
          src={Images?.icon?.siderIcon}
          className={`${siderBarView ? "rotate-180" : "rotate-0"} z-[999] text-[25px] transition-all duration-500 cursor-pointer`}
        />
      </div>
      <Link to="/">
        <main className="mt-[20px] w-full flex justify-start transition-all duration-500 ml-8 overflow-hidden">
          <img src={Images?.smallLogo} className="h-[40px] black md:hidden" />
          <div className="  ">
            {siderBarView ? (
              <img src={Images?.logo} className="h-[40px] hidden md:block" />
            ) : (
              <img
                src={Images?.smallLogo}
                className="h-[40px] hidden md:block"
              />
            )}{" "}
          </div>
        </main>
      </Link>

      <div>
        <div className="mt-10">
          {navData.map((item) => (
            <NavLink
              to={`/${item?.URL}`}
              key={item.id}
              className={({ isActive }) =>
                `flex items-center mx-8 px-2 rounded-xl py-3 my-2 capitalize  transition-all duration-500 overflow-hidden
               ${
                 isActive
                   ? "text-[#fff] bg-[#FF6C2D]"
                   : "hover:bg-[#ff6c2dea] hover:[#fff]"
               }
               ${handleStart && "first:text-[#fff] first:bg-[#FF6C2D]"}
                
                `
              }
            >
              <img src={item?.icon} className="h-[15px] text-red-400" />
              <span className="ml-2 text-[#fff] text-md font-medium">{siderBarView && item.title}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex-1" />
      <div
        className={`${timeChange ? "px-3 items-start" : "px-7 "} py-8 cursor-pointer flex gap-3 w-full transition-all duration-500 border-t-1 border-gray-300 `}      
       >
        <Link to="/account">
          <img
            alt="avatar"
            src={data?.avatar || Images?.avatar}
            loading="lazy"
            className="w-10 h-10 object-contain rounded-full "
          />
         </Link>

        
        {timeChange && (
          <div className="hidden flex-1 md:flex justify-between items-center ">
            <Link to="/account">
              <div>
                <p className="text-[13px] text-[#fff] font-semibold  transition-all capitalize duration-500">
                  {data?.firstName + ' ' + data?.lastName }
                </p>
                <p className="leading-0 mt-2 font-normal text-[12px] text-[#fff] transition-all duration-500">
                  {data?.email}
                </p>
              </div>
            </Link>

            <AiOutlineLogout  
               onClick={() => {
                useOnboardingStore.persist.clearStorage(); 
                localStorage.clear(); 
                sessionStorage.clear(); 
                useOnboardingStore.setState({ 
                  token: null, 
                  isAuthorized: false, 
                  firstName: "", 
                  lastName: "" 
                });
              
                navigate("/login");
              }}   
              className="text-lg me-2"/>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiderScreen;
