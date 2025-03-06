// src/components/dashboard/ActionButtons.jsx
import React from "react";
import { XCircle, CheckCircle } from "lucide-react";

const ActionButtons = ({
  onEndClick,
  onNextClick,
  currentTransaction,
  isProcessing,
}) => {
  return (
    <div className="w-full flex justify-between items-center pb-4">
      <button
        onClick={onEndClick}
        disabled={!currentTransaction || isProcessing}
        className="flex items-center gap-2 font-rubik font-semibold bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-2xl shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <XCircle size={20} className="text-white" />
        End Transaction
      </button>
      <button
        onClick={onNextClick}
        disabled={currentTransaction || isProcessing}
        className="flex items-center gap-2 font-rubik font-semibold bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-2xl shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle size={20} className="text-white" />
        Next Transaction
      </button>
    </div>
  );
};

export default ActionButtons;
