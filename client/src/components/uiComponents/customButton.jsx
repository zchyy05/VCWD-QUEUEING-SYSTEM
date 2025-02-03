import React from "react";

const CustomButton = ({
  onClick,
  className,
  children,
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      className={`px-4 py-2 rounded transition-colors duration-200 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default CustomButton;
