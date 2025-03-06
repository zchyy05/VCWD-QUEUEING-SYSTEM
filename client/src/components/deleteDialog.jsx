import React, { useEffect } from "react";

const DeleteQueueDialog = ({
  isOpen,
  onClose,
  onConfirm,
  queueNumber,
  isProcessing,
  isSkipProcessing,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={(e) => {
          if (!isProcessing && !isSkipProcessing) {
            onClose();
          }
        }}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Delete Queue
              </h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete queue {queueNumber}? This action
                cannot be undone.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onClose}
                disabled={isProcessing || isSkipProcessing}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onConfirm}
                disabled={isProcessing || isSkipProcessing}
              >
                {isProcessing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteQueueDialog;
