import React from "react";

const CustomInput = ({
  label,
  type = "text",
  value = "",
  onChange,
  leftIcon,
  rightIcon,
  className = "",
  inputClassName = "",
  labelClassName = "",
  ...props
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className={`mb-1 font-medium ${labelClassName}`}>{label}</label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-gray-500">{leftIcon}</span>
        )}
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          className={`w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClassName}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-gray-500">{rightIcon}</span>
        )}
      </div>
    </div>
  );
};

export default CustomInput;
