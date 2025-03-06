import React from "react";
import { Clock, User, BookCopy, AlertCircle, Building } from "lucide-react";

export const TransactionCard = ({
  transaction,
  formatTime,
  theme,
  isLarge = false,
}) => {
  console.log(transaction);
  if (!transaction) {
    return (
      <div
        className={`${theme.waitingListBg} rounded-lg shadow p-4 flex items-center justify-center`}
      >
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>No transaction data</span>
      </div>
    );
  }

  // Determine text size based on isLarge prop
  const queueNumberSize = isLarge ? "text-5xl" : "text-3xl";
  const labelSize = isLarge ? "text-base" : "text-sm";

  return (
    <div
      className={`${theme.waitingListBg} rounded-lg shadow p-4 ${
        isLarge ? "p-6" : "p-4"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div
          className={`${queueNumberSize} font-bold ${
            transaction.customer?.priority_type === "priority"
              ? theme.priorityColor
              : theme.normalColor
          }`}
        >
          #{transaction.queue_number}
        </div>
        <div
          className={`${theme.terminalBg} ${theme.bannerText} px-4 py-2 rounded-full ${labelSize} font-medium flex items-center`}
        >
          Window {transaction.terminal_number}
        </div>
      </div>

      <div className={`space-y-3 mb-4 ${labelSize}`}>
        {transaction.customer && (
          <div className="flex items-center gap-2 text-gray-600">
            <User className={`${isLarge ? "h-5 w-5" : "h-4 w-4"}`} />
            <span className={`${isLarge ? "text-lg" : "text-sm"} font-medium`}>
              {transaction.customer.name || "Anonymous"}
            </span>
            {transaction.customer.priority_type === "priority" && (
              <span
                className={`${theme.priorityBg} text-xs px-2 py-0.5 rounded-full ml-auto`}
              >
                Priority
              </span>
            )}
          </div>
        )}

        {/* Division Name */}
        {transaction.division_name && (
          <div className="flex items-center gap-2 text-gray-600">
            <Building className={`${isLarge ? "h-5 w-5" : "h-4 w-4"}`} />
            <span className={`${isLarge ? "text-lg" : "text-sm"}`}>
              {transaction.division_name}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600">
          <Clock className={`${isLarge ? "h-5 w-5" : "h-4 w-4"}`} />
          <span className={`${isLarge ? "text-lg" : "text-sm"}`}>
            Started: {formatTime(transaction.started_at)}
          </span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className={`h-${isLarge ? "2" : "1"} bg-gray-200 rounded-full`}>
        <div
          className={`h-${isLarge ? "2" : "1"} ${
            transaction.customer?.priority_type === "priority"
              ? "bg-red-500"
              : `bg-${theme.primary}-500`
          } rounded-full`}
          style={{ width: "70%" }}
        ></div>
      </div>
    </div>
  );
};
