import React, { useState } from "react";
import images from "../../constants/images";
import { Link } from "react-router-dom";
import CustomInput from "../../components/uiComponents/customInput";
import CustomButton from "../../components/uiComponents/customButton";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const SignIn = () => {
  const [data, setData] = useState({
    email: null,
    password: null,
  });
  const [passwordType, setPasswordType] = useState(true);

  const toggleHidePassword = () => {
    setPasswordType(!passwordType);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-secondary" />
        <div className="relative flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
            <img
              src={images.logo}
              alt="logo"
              className="w-48 h-48 object-contain"
            />
          </div>
          <h1 className="font-rubik font-bold text-4xl text-center mb-6 leading-tight">
            Welcome to
            <span className="block mt-2">Valencia City Water District</span>
          </h1>
          <p className="font-rubik text-lg text-center mb-12 max-w-md opacity-90">
            VCWD shall provide reliable efficient & effective delivery of water
            services to Valencia City.
          </p>
          <Link
            to="/auth/signup"
            className="font-rubik px-12 py-4 text-lg bg-white rounded-xl text-primary 
                     hover:bg-opacity-90 transition-all duration-300 shadow-lg
                     hover:shadow-xl transform hover:-translate-y-1"
          >
            Sign Up
          </Link>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-8 py-12">
          <div className="text-center mb-10">
            <h1 className="font-rubik text-4xl font-bold text-primary mb-4">
              Sign In
            </h1>
            <p className="font-rubik text-secondary text-lg">
              Valencia City Water District:
              <span className="block mt-1">
                Sign In Today, Secure Clean Water for Tomorrow!
              </span>
            </p>
          </div>

          <div className="space-y-6">
            <CustomInput
              label="Email"
              labelClassName="text-gray-700 font-medium mb-1 block"
              placeholder="Enter your email"
              leftIcon={<Mail className="text-gray-500" />}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              value={data.email}
              inputClassName="bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300"
              type="email"
            />

            <CustomInput
              label="Password"
              labelClassName="text-gray-700 font-medium mb-1 block"
              type={passwordType ? "password" : "text"}
              placeholder="Enter your password"
              leftIcon={<Lock className="text-gray-500" />}
              rightIcon={
                <button
                  type="button"
                  onClick={toggleHidePassword}
                  className="hover:text-primary transition-colors duration-300"
                >
                  {passwordType ? <EyeOff /> : <Eye />}
                </button>
              }
              onChange={(e) => setData({ ...data, password: e.target.value })}
              value={data.password}
              inputClassName="bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300"
            />

            <div className="flex justify-end">
              <button
                className="font-rubik text-sm text-red-400 hover:text-red-500 
                               transition-colors duration-300 underline-offset-2 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <CustomButton
              children="Sign in"
              className="w-full py-3 bg-secondary text-primary font-medium rounded-lg
                        transform hover:-translate-y-0.5 transition-all duration-300
                        hover:shadow-lg active:translate-y-0 active:shadow-md"
            />

            {/* Mobile Sign Up Link */}
            <div className="mt-8 text-center lg:hidden">
              <p className="text-gray-600 mb-4">Don't have an account?</p>
              <Link
                to="/signup"
                className="font-rubik px-8 py-3 bg-primary text-white rounded-lg
                          hover:bg-opacity-90 transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
