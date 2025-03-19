import React from "react";
import { ClipboardList, AlertCircle } from "lucide-react";
import { TransactionCard } from "./transactionCard";

const CurrentlyServingSection = ({ transactions, formatTime, theme }) => {
  const activeTransactions = transactions.filter((t) => !t.completed_at);

  return (
    <div
      className={`${theme.cardBackground} rounded-xl shadow-lg h-full flex flex-col`}
    >
      <div className={`${theme.banner} px-4 py-3 flex-shrink-0`}>
        <h2 className="text-xl font-bold text-white flex items-center">
          <ClipboardList className="h-6 w-6 mr-2" />
          Currently Serving
          <span className="ml-3 text-sm bg-white/20 px-3 py-1 rounded-full">
            {activeTransactions.length} active
          </span>
        </h2>
      </div>

      <div className="p-4 flex-grow overflow-x-auto">
        {Array.isArray(transactions) && activeTransactions.length > 0 ? (
          <div className="flex flex-row space-x-4 min-w-full pb-2">
            {activeTransactions.map((transaction) => (
              <div key={transaction.queue_id} className="w-64 flex-shrink-0">
                <TransactionCard
                  transaction={transaction}
                  formatTime={formatTime}
                  theme={theme}
                  isLarge={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            No transactions in progress
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentlyServingSection;
