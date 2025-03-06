import React, { useState } from "react";
import { X } from "lucide-react";
import { createQueue } from "../services/queueService";
import SwitchComponent from "./uiComponents/switchComponent";
import { useQueuePrinting } from "../hooks/useQueuePrinting";

const CustomerModal = ({ isOpen, onClose, onQueueAdded, selectedDivision }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    accountNumber: "",
    isPriority: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { printQueue } = useQueuePrinting();

  const validateForm = () => {
    const newErrors = {};

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const queueData = {
        customer_name: formData.customerName || null,
        account_number: formData.accountNumber || null,
        division_id: selectedDivision.division_id,
        priority_type: formData.isPriority ? "priority" : "regular",
      };

      const response = await createQueue(queueData);
      console.log("Queue Response:", response.queue);

      printQueue(response.queue);

      setFormData({
        customerName: "",
        accountNumber: "",
        isPriority: false,
      });

      if (onQueueAdded) {
        onQueueAdded();
      }

      onClose();
    } catch (error) {
      setError(error.message || "Failed to create queue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePriorityToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isPriority: checked,
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-rubik font-medium text-center text-blue-600">
            {selectedDivision?.division_name || "Customer Information"}
          </h2>
          <p className="text-center text-gray-600 mt-2 font-rubik">
            Please fill in your details (optional)
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-gray-700 mb-1 font-rubik"
            >
              Customer Name (Optional)
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-rubik ${
                errors.customerName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your full name"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-500 font-rubik">
                {errors.customerName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="accountNumber"
              className="block text-sm font-medium text-gray-700 mb-1 font-rubik"
            >
              Account Number (Optional)
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-rubik ${
                errors.accountNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter account number"
            />
            {errors.accountNumber && (
              <p className="mt-1 text-sm text-red-500 font-rubik">
                {errors.accountNumber}
              </p>
            )}
          </div>

          <div>
            <SwitchComponent
              checked={formData.isPriority}
              onChange={handlePriorityToggle}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium font-rubik disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
