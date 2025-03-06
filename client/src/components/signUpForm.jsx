import React, { useState } from "react";
import { Link } from "react-router-dom";
import CustomButton from "./uiComponents/customButton";
import { Mail, Lock, Phone, User, ArrowLeft } from "lucide-react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import CustomLoading from "./uiComponents/customLoading";
const SignUpForm = ({
  step,
  formData,
  handleInputChange,
  errors,
  isLoading,
  prevStep,
  nextStep,
  handleSubmit,
  successMessage,
}) => (
  <div className="w-full max-w-md px-8 py-12">
    <div className="text-center mb-10">
      <h1 className="font-rubik text-4xl font-bold text-primary mb-4 p-5">
        Sign Up
      </h1>
    </div>
    {step === 2 && (
      <div className="mb-6">
        <button
          onClick={prevStep}
          className="flex items-center text-primary hover:text-primary/80 transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Previous Step
        </button>
      </div>
    )}

    {errors.submit && (
      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
        {errors.submit}
      </div>
    )}
    {successMessage && (
      <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg text-center">
        {successMessage}
      </div>
    )}
    {step === 1 && (
      <>
        <StepOne
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
        />
        <div className="mt-6">
          <CustomButton
            children="Next"
            className="w-full py-3 px-6 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={nextStep}
          />
        </div>
      </>
    )}

    {step === 2 && (
      <>
        <StepTwo
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
        />
        <div className="mt-6">
          <CustomButton
            children={isLoading ? <CustomLoading /> : "Sign Up"}
            className="w-full py-3 px-6 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isLoading}
          />
        </div>
      </>
    )}
  </div>
);

export default SignUpForm;
