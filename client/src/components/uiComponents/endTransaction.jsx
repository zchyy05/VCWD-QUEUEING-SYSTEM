import React, { useState, useEffect, useCallback } from "react";
import { X, Info } from "lucide-react";
import Switch from "@mui/material/Switch";

const EndTransactionDialog = ({
  isOpen,
  onClose,
  onConfirm,
  accountNumber,
  setAccountNumber,
  isProcessing,
  currentTransaction,
}) => {
  const [isOptional, setIsOptional] = useState(false);
  const [localAccountNumber, setLocalAccountNumber] = useState("");

  // Reset everything when dialog opens - don't auto-populate from currentTransaction
  useEffect(() => {
    if (isOpen) {
      // Start with empty field
      setLocalAccountNumber("");
      setIsOptional(true);

      // Log dialog opening
      console.log("Dialog opened - input field cleared");
    }
  }, [isOpen]);

  // Handle local input change only - no auto sync with parent state
  const handleAccountNumberChange = (e) => {
    const value = e.target.value;
    setLocalAccountNumber(value);
  };

  // Handle submit and only now update the parent state
  const handleSubmit = () => {
    // Only set parent account number when submitting
    setAccountNumber(localAccountNumber);
    onConfirm();
  };

  // Check if submit is allowed
  const isSubmitDisabled =
    isProcessing || (!isOptional && !localAccountNumber?.trim());

  // Handle keyboard Enter key press
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !isSubmitDisabled) {
        handleSubmit();
      }
    },
    [isSubmitDisabled, handleSubmit]
  );

  // Add and remove event listener when dialog is open
  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            End Transaction {currentTransaction?.queue_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center cursor-pointer">
              <div className="mr-3 text-sm font-medium text-gray-700">
                Optional Account Number
              </div>
              <Switch
                checked={isOptional}
                onChange={(e) => setIsOptional(e.target.checked)}
                disabled={isProcessing}
                color="primary"
              />
            </label>
          </div>

          {isOptional && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-start gap-2">
              <Info size={16} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Note: You're ending the transaction without an account number.
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Account Number
              {isOptional && (
                <span className="text-gray-400 text-xs ml-2">(Optional)</span>
              )}
            </label>
            <input
              type="text"
              value={localAccountNumber}
              onChange={handleAccountNumberChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isOptional
                  ? "Enter account number (optional)"
                  : "Enter account number"
              }
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:bg-gray-50 disabled:text-gray-500"
            />
            {!isOptional && !localAccountNumber?.trim() && (
              <p className="text-sm text-gray-500">
                Account number is required to end the transaction
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md 
                     hover:bg-gray-200 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="px-4 py-2 text-white bg-blue-600 rounded-md 
                     hover:bg-blue-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "End Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndTransactionDialog;
