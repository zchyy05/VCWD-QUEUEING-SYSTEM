import React, { useEffect, useState } from "react";

export const TerminalModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  divisions,
}) => {
  const [formData, setFormData] = useState({
    division_id: "",
    terminalNumber: "",
    terminalCount: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        division_id: initialData.division.division_id,
        terminalNumber: initialData.terminalNumber,
        terminalCount: initialData.terminalNumber, // Set both values
      });
    } else {
      setFormData({
        division_id: "",
        terminalNumber: "",
        terminalCount: "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const submissionData = initialData
      ? {
          division_id: Number(formData.division_id),
          terminalNumber: Number(formData.terminalNumber),
        }
      : {
          division_id: Number(formData.division_id),
          terminalCount: Number(
            formData.terminalCount || formData.terminalNumber
          ),
        };

    onSubmit(submissionData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Update both terminalNumber and terminalCount when either changes
      ...(name === "terminalNumber" || name === "terminalCount"
        ? { terminalNumber: value, terminalCount: value }
        : { [name]: value }),
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? "Edit Terminal" : "Add Terminal"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="division_id"
              className="block text-sm font-medium text-gray-700"
            >
              Division
            </label>
            <select
              id="division_id"
              name="division_id"
              value={formData.division_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">Select Division</option>
              {divisions.map((division) => (
                <option key={division.division_id} value={division.division_id}>
                  {division.division_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="terminalNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Terminal Number
            </label>
            <input
              type="number"
              id="terminalNumber"
              name={initialData ? "terminalNumber" : "terminalCount"}
              value={
                initialData ? formData.terminalNumber : formData.terminalCount
              }
              onChange={handleChange}
              required
              min="1"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
