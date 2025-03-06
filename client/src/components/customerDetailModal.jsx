import React, { useState, useEffect } from "react";
import { X, UserRound, ClipboardList, Clock, Calendar } from "lucide-react";
import { useCustomer } from "../hooks/useCustomer";

const CustomerDetailModal = ({ isOpen, onClose, customerId }) => {
  const {
    fetchCustomerDetails,
    fetchCustomerHistory,
    customerDetails,
    customerHistory,
    loading,
  } = useCustomer();
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetails(customerId);
      fetchCustomerHistory(customerId);
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div
      className="fixed inset-0  flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">
            {loading
              ? "Loading..."
              : customerDetails?.customer_name || "Customer Details"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "details"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Customer Details
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "history"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("history")}
          >
            Queue History
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !customerDetails ? (
            <div className="text-center py-8 text-gray-500">
              Customer information not available
            </div>
          ) : (
            <>
              {activeTab === "details" && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <UserRound className="text-primary" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Customer Name</p>
                        <p className="font-medium">
                          {customerDetails.customer_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Number</p>
                        <p className="font-medium">
                          {customerDetails.account_number || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Priority Type</p>
                        <p className="font-medium capitalize">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              customerDetails.priority_type === "priority"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {customerDetails.priority_type}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Registration Date
                        </p>
                        <p className="font-medium">
                          {formatDate(customerDetails.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <ClipboardList className="text-primary" />
                      Current Queue Status
                    </h3>
                    {customerDetails.queues &&
                    customerDetails.queues.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Queue Number
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Division
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Position
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created At
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerDetails.queues.map((queue) => (
                              <tr
                                key={queue.queue_id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {queue.queue_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {queue.division?.division_name || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      queue.status === "Waiting"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : queue.status === "Processing"
                                        ? "bg-blue-100 text-blue-800"
                                        : queue.status === "Completed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {queue.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {queue.position || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {formatDate(queue.created_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No active queues for this customer
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Clock className="text-primary" />
                      Queue History
                    </h3>
                    {customerHistory && customerHistory.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Queue Number
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Division
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Transactions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerHistory.map((queue) => (
                              <tr
                                key={queue.queue_id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {queue.queue_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {queue.division?.division_name || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      queue.status === "Waiting"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : queue.status === "Processing"
                                        ? "bg-blue-100 text-blue-800"
                                        : queue.status === "Completed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {queue.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {formatDate(queue.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {queue.transactions?.length || 0}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No queue history available
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;
