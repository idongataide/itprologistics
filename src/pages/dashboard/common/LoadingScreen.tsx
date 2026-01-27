import React from "react";
import { Link } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { Button } from "antd";
import Images from "../../../components/images";

const LoadingScreen: React.FC = () => {
  return (
    <div
      className="w-full h-screen absolute top-0 left-0 flex flex-col justify-center items-center "
      style={{
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(73, 154, 255, 0.3)",
      }}
    >
       <div className="relative flex justify-center items-center mb-7">
        <FaSpinner
          color="#000000"
          size={20}
          className="absolute top-12 animate-spin"
        />
        <img className=" h-[28px] mt-2 animate-pulse" src={Images.logodark} />
      </div>

      <div className="w-full flex-col flex items-center mt-3">
        {" "}
        <p className="mt-8">Loading...</p>
        <Link to="/" className="cursor-pointer">
          <Button className={`bg-blue-500 text-white mt-2 cursor-pointer`}>
            Please wait
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LoadingScreen;
