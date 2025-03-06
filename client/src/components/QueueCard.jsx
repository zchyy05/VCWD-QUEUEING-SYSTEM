import React, { useState } from "react";
import {
  Phone,
  User,
  Clock,
  Trash2,
  Loader2,
  ArrowUpFromLine,
  Users,
  AlertCircle,
} from "lucide-react";

const QueueCard = ({
  queue,
  isLoading,
  onSkip,
  onDelete,
  onCallSkipped,
  compact = false,
  showActions = true,
}) => {
  const [isSkipping, setIsSkipping] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const handleSkip = async (queueId) => {
    setIsSkipping(true);
    try {
      await onSkip?.(queueId);
    } finally {
      setIsSkipping(false);
    }
  };

  const handleCallSkipped = async (queueId) => {
    setIsCalling(true);
    try {
      await onCallSkipped?.(queueId);
    } finally {
      setIsCalling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const cardContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {queue.queue_number}
          </span>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full
            ${
              queue.priority_type === "priority"
                ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                : "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
            }`}
        >
          {queue.priority_type.charAt(0).toUpperCase() +
            queue.priority_type.slice(1)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
          <span className="text-gray-700 font-medium">
            {queue.customer_name || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <Phone size={16} className="text-blue-600" />
          </div>
          <span className="text-gray-700 font-medium">
            {queue.account_number || "N/A"}
          </span>
        </div>
      </div>

      {showActions && (
        <div className="mt-6 flex justify-end gap-2">
          {queue.is_skipped ? (
            <button
              onClick={() => handleCallSkipped(queue.queue_id)}
              disabled={isCalling}
              className="group px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg 
                       hover:bg-emerald-100 transition-all duration-200 
                       flex items-center gap-2 ring-1 ring-emerald-600/20
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalling ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowUpFromLine
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
              )}
              <span className="font-medium">
                {isCalling ? "Calling..." : "Call"}
              </span>
            </button>
          ) : (
            <button
              onClick={() => handleSkip(queue.queue_id)}
              disabled={isSkipping}
              className="group px-4 py-2 bg-amber-50 text-amber-700 rounded-lg 
                       hover:bg-amber-100 transition-all duration-200 
                       flex items-center gap-2 ring-1 ring-amber-600/20
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSkipping ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Clock
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
              )}
              <span className="font-medium">
                {isSkipping ? "Skipping..." : "Skip"}
              </span>
            </button>
          )}

          <button
            onClick={() => onDelete?.(queue.queue_id)}
            disabled={isSkipping}
            className="group px-4 py-2 bg-red-50 text-red-700 rounded-lg 
                     hover:bg-red-100 transition-all duration-200 
                     flex items-center gap-2 ring-1 ring-red-600/20
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-medium">Delete</span>
          </button>
        </div>
      )}
    </>
  );

  return (
    <div
      className={`bg-white rounded-xl shadow-sm ${
        compact ? "p-4" : "p-6"
      } border border-gray-100 transition-all duration-300 hover:shadow-md
      ${queue.is_skipped ? "border-l-4 border-l-amber-500" : ""}`}
    >
      {cardContent}
    </div>
  );
};

export default QueueCard;
