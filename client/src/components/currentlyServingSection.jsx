import React from "react";
import { ClipboardList, AlertCircle } from "lucide-react";
import { TransactionCard } from "./transactionCard";

const CurrentlyServingSection = ({ transactions, formatTime, theme }) => {
  // Filter active transactions (not completed)
  const activeTransactions = transactions.filter((t) => !t.completed_at);

  return (
    <div
      className={`${theme.cardBackground} rounded-xl shadow-lg overflow-hidden`}
    >
      {/* Header with more emphasis */}
      <div className={`${theme.banner} px-6 py-4`}>
        <h2 className="text-2xl font-bold text-white flex items-center">
          <ClipboardList className="h-7 w-7 mr-3" />
          Currently Serving
          <span className="ml-3 text-sm bg-white/20 px-3 py-1 rounded-full">
            {activeTransactions.length} active
          </span>
        </h2>
      </div>

      <div className="p-4">
        {Array.isArray(transactions) && activeTransactions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.queue_id}
                transaction={transaction}
                formatTime={formatTime}
                theme={theme}
                isLarge={true}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500 text-lg">
            <AlertCircle className="h-5 w-5 mr-2" />
            No transactions in progress
          </div>
        )}
      </div>
    </div>
  );
};
export default CurrentlyServingSection;
