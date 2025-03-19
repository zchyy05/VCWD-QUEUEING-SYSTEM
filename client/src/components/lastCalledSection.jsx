import React from "react";
import { Zap, AlertCircle } from "lucide-react";

const LastCalledSection = ({ transaction, formatTime, theme }) => {
  return (
    <div
      className={`${theme.cardBackground} rounded-xl shadow-lg h-full flex flex-col`}
    >
      <div className={`p-4 ${theme.textPrimary} flex-shrink-0`}>
        <h2 className={`text-xl font-bold flex items-center`}>
          <Zap className={`h-6 w-6 mr-2 ${theme.normalColor}`} />
          Last Called
        </h2>
      </div>

      <div className="flex-grow flex items-center justify-center p-4">
        {transaction ? (
          <div
            className={`${theme.waitingListBg} rounded-lg p-4 w-full text-center`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div
                className={`text-5xl font-bold ${
                  transaction.customer?.priority_type === "priority"
                    ? theme.priorityColor
                    : theme.normalColor
                }`}
              >
                #{transaction.queue_number}
              </div>
              <div
                className={`${theme.terminalBg} ${theme.bannerText} px-4 py-2 rounded-full text-lg font-medium`}
              >
                Terminal {transaction.terminal_number}
              </div>
              <div className="text-gray-500">
                Called at: {formatTime(transaction.started_at)}
              </div>
              {transaction.completed_at && (
                <div className="text-green-600 text-sm">
                  Completed at: {formatTime(transaction.completed_at)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            No queue numbers called
          </div>
        )}
      </div>
    </div>
  );
};

export default LastCalledSection;
