import React, { useState, useEffect } from "react";
import images from "../../constants/images";
import { Link, useNavigate } from "react-router-dom";
import CustomInput from "../../components/uiComponents/customInput";
import CustomButton from "../../components/uiComponents/customButton";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthContext } from "../../context/authContext";

const SignIn = () => {
  const { error, signIn, loading, user } = useAuthContext();
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showError, setShowError] = useState(false);
  const [passwordType, setPasswordType] = useState(true);

  useEffect(() => {
    let timeoutId;
    if (showError && (errors.email || errors.password || error)) {
      timeoutId = setTimeout(() => {
        setShowError(false);
        setErrors({ email: "", password: "" });
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [showError, errors, error]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
    };

    if (!data.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!data.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    setShowError(true); // Show error when validation fails
    return isValid;
  };

  const toggleHidePassword = () => {
    setPasswordType(!passwordType);
  };

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        await signIn(data.email, data.password);
        navigate("/dashboard");
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

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
            className="font-rubik px-12 py-4 text-xl bg-white rounded-xl text-primary 
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
              inputClassName={`bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300 
          ${showError && errors.email ? "border-red-500" : ""}`}
              type="email"
            />
            {showError && errors.email && (
              <p className="text-red-500 text-sm -mt-4">{errors.email}</p>
            )}

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
              inputClassName={`bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300
          ${showError && errors.password ? "border-red-500" : ""}`}
            />
            {showError && errors.password && (
              <p className="text-red-500 text-sm -mt-4">{errors.password}</p>
            )}
            {error && showError && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <CustomButton
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3 bg-secondary text-primary font-medium rounded-lg
                transform hover:-translate-y-0.5 transition-all duration-300
                hover:shadow-lg active:translate-y-0 active:shadow-md
                ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </CustomButton>

            <div className="mt-8 text-center lg:hidden">
              <p className="text-gray-600 mb-4">Don't have an account?</p>
              <Link
                to="/auth/signup"
                className="font-rubik px-8 py-3  text-white rounded-lg
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
