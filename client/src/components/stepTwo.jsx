import React, { useState } from "react";
import { Link } from "react-router-dom";
import CustomInput from "./uiComponents/customInput";
import {
  Mail,
  Lock,
  Phone,
  User,
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useDivisions } from "../context/divisionsContext";

const StepTwo = ({ formData, handleInputChange, errors }) => {
  const { divisions } = useDivisions();
  const [passwordType, setPasswordType] = useState(true);
  const [confirmPasswordType, setConfirmPasswordType] = useState(true); // true means password is hidden

  const toggleHidePassword = () => {
    setPasswordType(!passwordType);
  };
  const toggleHideConfirmPassword = () => {
    setConfirmPasswordType(!confirmPasswordType);
  };

  return (
    <div className="space-y-3">
      <CustomInput
        label="Username"
        labelClassName="text-gray-700 font-medium mb-1 block"
        inputClassName={`bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300 ${
          errors.username ? "border-red-500" : ""
        }`}
        leftIcon={<User />}
        placeholder="Enter your Username"
        value={formData.username}
        onChange={handleInputChange("username")}
        error={errors.username}
        required
      />
      {errors.username && (
        <p className="text-red-500 text-sm mt-1">{errors.username}</p>
      )}

      <div className="space-y-1">
        <label className="text-gray-700 font-medium block">Division</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Building2 className="w-5 h-5" />
          </div>
          <select
            value={formData.division_id || ""}
            onChange={handleInputChange("division_id")}
            className={`w-full pl-10 pr-4 py-2 bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300 appearance-none ${
              errors.division_id ? "border-red-500" : ""
            }`}
          >
            <option value="">Select Division</option>
            {divisions?.map((division) => (
              <option key={division.division_id} value={division.division_id}>
                {division.division_name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 fill-current text-gray-500"
              viewBox="0 0 20 20"
            >
              <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
            </svg>
          </div>
        </div>
        {errors.division_id && (
          <p className="text-red-500 text-sm mt-1">{errors.division_id}</p>
        )}
      </div>

      <CustomInput
        label="Password"
        labelClassName="text-gray-700 font-medium mb-1 block"
        inputClassName={`bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300 ${
          errors.password ? "border-red-500" : ""
        }`}
        leftIcon={<Lock />}
        rightIcon={
          <button
            type="button"
            onClick={toggleHidePassword}
            className="hover:text-primary transition-colors duration-300"
          >
            {passwordType ? <EyeOff /> : <Eye />}
          </button>
        }
        type={passwordType ? "password" : "text"}
        placeholder="Enter your Password"
        value={formData.password}
        onChange={handleInputChange("password")}
        error={errors.password}
        required
      />
      {errors.password && (
        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
      )}

      <CustomInput
        label="Confirm Password"
        inputClassName={`bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300 ${
          errors.confirmPassword ? "border-red-500" : ""
        }`}
        labelClassName="text-gray-700 font-medium mb-1 block"
        leftIcon={<Lock />}
        rightIcon={
          <button
            type="button"
            onClick={toggleHideConfirmPassword}
            className="hover:text-primary transition-colors duration-300"
          >
            {confirmPasswordType ? <EyeOff /> : <Eye />}
          </button>
        }
        type={confirmPasswordType ? "password" : "text"}
        placeholder="Confirm your Password"
        value={formData.confirmPassword}
        onChange={handleInputChange("confirmPassword")}
        error={errors.confirmPassword}
        required
      />
      {errors.confirmPassword && (
        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
      )}
    </div>
  );
};

export default StepTwo;
