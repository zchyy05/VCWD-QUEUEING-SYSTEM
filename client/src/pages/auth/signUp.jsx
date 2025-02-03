import React from "react";
import images from "../../constants/images";
import { Link } from "react-router-dom";
const SignUp = () => {
  return (
    <>
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
              VCWD shall provide reliable efficient & effective delivery of
              water services to Valencia City.
            </p>
            <Link
              to="/auth/signin"
              className="font-rubik px-12 py-4 text-lg bg-white rounded-xl text-primary 
                     hover:bg-opacity-90 transition-all duration-300 shadow-lg
                     hover:shadow-xl transform hover:-translate-y-1"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md px-8 py-12">
            <div className="text-center mb-10">
              <h1 className="font-rubik text-4xl font-bold text-primary mb-4">
                Sign Up
              </h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
