import React, { useState } from "react";
import { Link } from "react-router-dom";
import CustomInput from "./uiComponents/customInput";
import { Mail, Lock, Phone, User, ArrowLeft } from "lucide-react";
const StepOne = ({ formData, handleInputChange, errors }) => (
  <div className="space-y-3">
    <div className="space-y-1">
      <CustomInput
        label="First Name"
        labelClassName="text-gray-700 font-medium mb-1 block"
        inputClassName={`bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300 ${
          errors.firstName ? "border-red-500" : ""
        }`}
        leftIcon={<User />}
        placeholder="Enter your First Name"
        value={formData.firstName}
        onChange={handleInputChange("firstName")}
        error={errors.firstName}
        required
      />
      {errors.firstName && (
        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
      )}
    </div>

    <div className="space-y-1">
      <CustomInput
        label="Middle Name"
        labelClassName="text-gray-700 font-medium mb-1 block"
        inputClassName="bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300"
        leftIcon={<User />}
        placeholder="Enter your Middle Name"
        value={formData.middleName}
        onChange={handleInputChange("middleName")}
      />
    </div>

    <div className="space-y-1">
      <CustomInput
        label="Last Name"
        labelClassName="text-gray-700 font-medium mb-1 block"
        inputClassName={`bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300 ${
          errors.lastName ? "border-red-500" : ""
        }`}
        leftIcon={<User />}
        placeholder="Enter your Last Name"
        value={formData.lastName}
        onChange={handleInputChange("lastName")}
        error={errors.lastName}
        required
      />
      {errors.lastName && (
        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
      )}
    </div>

    <div className="space-y-1">
      <CustomInput
        label="Email"
        labelClassName="text-gray-700 font-medium mb-1 block"
        inputClassName={`bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300 ${
          errors.email ? "border-red-500" : ""
        }`}
        leftIcon={<Mail />}
        placeholder="Enter your Email"
        value={formData.email}
        onChange={handleInputChange("email")}
        error={errors.email}
        type="email"
        required
      />
      {errors.email && (
        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
      )}
    </div>

    <div className="space-y-1">
      <CustomInput
        label="Phone Number"
        labelClassName="text-gray-700 font-medium mb-1 block"
        inputClassName={`bg-[#D4E2FF] rounded-lg hover:bg-[#E2EBFF] transition-colors duration-300 ${
          errors.phone_number ? "border-red-500" : ""
        }`}
        leftIcon={<Phone />}
        placeholder="Enter your Phone Number"
        value={formData.phone_number}
        onChange={handleInputChange("phone_number")}
        error={errors.phone_number}
        type="tel"
        required
      />
      {errors.phone_number && (
        <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
      )}
    </div>
  </div>
);

export default StepOne;
