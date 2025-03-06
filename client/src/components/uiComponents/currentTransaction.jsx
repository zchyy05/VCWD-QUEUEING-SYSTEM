import React from "react";
import { BellRing, SkipForward } from "lucide-react";

const CurrentTransaction = ({ transaction, onSkip, isProcessing }) => {
  if (!transaction) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-500">
            No active transaction. Click "Next Transaction" to serve the next
            customer in queue.
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Current Transaction
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => onSkip(transaction.queue_id)}
            disabled={isProcessing}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward size={18} />
            Skip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Queue Number</div>
          <div className="text-2xl font-bold text-gray-900">
            {transaction.queue_number}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Priority</div>
          <div className="flex items-center">
            <span
              className={`inline-block rounded-full w-3 h-3 mr-2 ${
                transaction.priority_type === "priority"
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
            ></span>
            <span className="text-lg font-semibold text-gray-900 capitalize">
              {transaction.priority_type}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Customer Name</div>
          <div className="text-lg font-semibold text-gray-900">
            {transaction.customer_name || "Not provided"}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Account Number</div>
          <div className="text-lg font-semibold text-gray-900">
            {transaction.account_number || "Not available"}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
          <div className="text-sm text-gray-500 mb-1">Status</div>
          <div className="text-lg font-semibold text-gray-900">
            {transaction.status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentTransaction;
