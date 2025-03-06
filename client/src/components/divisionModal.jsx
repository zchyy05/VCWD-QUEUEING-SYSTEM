import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export const DivisionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  departments = [],
}) => {
  const [formData, setFormData] = useState({
    division_name: "",
    department_id: "",
    queue_prefix: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        division_name: initialData.division_name,
        department_id: initialData.department.department_id,
        queue_prefix: initialData.queue_prefix || "",
      });
    } else {
      setFormData({
        division_name: "",
        department_id: departments[0]?.department_id || "",
        queue_prefix: "",
      });
    }
  }, [initialData, departments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {initialData ? "Edit Division" : "Add Division"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Division Name
              </label>
              <input
                type="text"
                value={formData.division_name}
                onChange={(e) =>
                  setFormData({ ...formData, division_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Added Queue Prefix field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Queue Prefix
              </label>
              <input
                type="text"
                value={formData.queue_prefix}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().slice(0, 3);
                  setFormData({ ...formData, queue_prefix: value });
                }}
                maxLength={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., ACC"
              />
              <p className="text-sm text-gray-500 mt-1">
                Max 3 characters. Leave empty to use first letter of division
                name.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={formData.department_id}
                onChange={(e) =>
                  setFormData({ ...formData, department_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              {initialData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
