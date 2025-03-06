import React, { useState } from "react";
import images from "../../constants/images";
import { Link, useNavigate } from "react-router-dom";
import SignUpForm from "../../components/signUpForm";
import { useAuthContext } from "../../context/authContext";
import { Building2, ChevronLeft, QrCode } from "lucide-react";

const SignUp = () => {
  const { signUp } = useAuthContext();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone_number: "",
    division_id: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{11}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.phone_number.trim())
      newErrors.phone_number = "Phone number is required";
    else if (!validatePhone(formData.phone_number))
      newErrors.phone_number = "Please enter a valid 11-digit phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.division_id) newErrors.division_id = "Division is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (!validatePassword(formData.password))
      newErrors.password = "Password must be at least 8 characters";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const prevStep = () => {
    setStep(1);
    const step1Errors = {};
    ["firstName", "middleName", "lastName", "email", "phone_number"].forEach(
      (field) => {
        if (errors[field]) step1Errors[field] = errors[field];
      }
    );
    setErrors(step1Errors);
  };

  const handleSubmit = async () => {
    if (validateStep2()) {
      setIsLoading(true);
      try {
        const { confirmPassword, ...signUpData } = formData;
        await signUp(signUpData);
        setSuccessMessage("Sign up successful! Redirecting to login...");
        setErrors({});
        setTimeout(() => {
          navigate("/auth/signin");
        }, 2000);
      } catch (error) {
        const errorMessage = error.response?.data?.message;
        if (errorMessage) {
          if (errorMessage.includes("phone_number")) {
            setErrors((prev) => ({
              ...prev,
              phone_number: errorMessage,
            }));
          } else if (errorMessage.includes("email")) {
            setErrors((prev) => ({
              ...prev,
              email: errorMessage,
            }));
          } else if (errorMessage.includes("username")) {
            setErrors((prev) => ({
              ...prev,
              username: errorMessage,
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              submit: errorMessage,
            }));
          }
        } else {
          setErrors((prev) => ({
            ...prev,
            submit: "An error occurred during sign up. Please try again.",
          }));
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-secondary" />
        <div className="relative flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="flex justify-start items-start py-4 w-full">
            <Link
              to="/"
              className="text-blue-100 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
          </div>
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
            to="/auth/signin"
            className="font-rubik px-12 py-4 text-xl bg-white rounded-xl text-primary 
                   hover:bg-opacity-90 transition-all duration-300 shadow-lg
                   hover:shadow-xl transform hover:-translate-y-1"
          >
            Sign In
          </Link>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50">
        <SignUpForm
          step={step}
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          isLoading={isLoading}
          prevStep={prevStep}
          nextStep={nextStep}
          handleSubmit={handleSubmit}
          successMessage={successMessage}
        />
      </div>
    </div>
  );
};

export default SignUp;
