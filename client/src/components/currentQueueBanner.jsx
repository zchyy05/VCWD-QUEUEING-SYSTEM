import React from "react";

const CurrentQueueBanner = ({ transaction, formatTime, theme }) => (
  <div className={`${theme.bannerBg} ${theme.bannerText} py-4 px-6 shadow-lg`}>
    <div className="container mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Now Serving:</span>
          <span className="text-4xl font-bold">
            #{transaction.queue_number}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span
            className={`${theme.terminalBg} px-3 py-1 rounded-full text-sm`}
          >
            Window {transaction.terminal_number}
          </span>
          <span className="text-sm">{formatTime(transaction.started_at)}</span>
        </div>
      </div>
    </div>
  </div>
);

export default CurrentQueueBanner;
