import React, { useState, useEffect } from "react";

const TransactionDebugMonitor = ({
  wsConnection,
  currentTransaction,
  queueData,
  isConnected,
}) => {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    setLastUpdate(new Date());
  }, [currentTransaction, queueData]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
      <h3 className="font-semibold text-gray-700">Transaction Debug Monitor</h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">WebSocket Status:</span>
          <span
            className={`text-sm font-medium ${
              isConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Current Transaction:</span>
          <span className="text-sm font-medium text-gray-900">
            {currentTransaction ? currentTransaction.queue_number : "null"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Queue Data Count:</span>
          <span className="text-sm font-medium text-gray-900">
            {queueData?.length || 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Last Update:</span>
          <span className="text-sm font-medium text-gray-900">
            {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {currentTransaction && (
        <div className="mt-4 p-3 bg-white rounded border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Transaction Details:
          </h4>
          <pre className="text-xs text-gray-600 overflow-auto max-h-40">
            {JSON.stringify(currentTransaction, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TransactionDebugMonitor;
