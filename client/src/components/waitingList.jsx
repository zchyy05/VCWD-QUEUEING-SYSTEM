import React, { memo, useState } from "react";
import { Users, AlertCircle, Clock } from "lucide-react";

const QueueNumber = memo(({ queue, theme }) => (
  <div
    className={`inline-block ${theme.queueNumberBg} rounded-lg shadow-sm px-6 py-3 mr-2 flex-shrink-0 border`}
  >
    <div className="flex items-center gap-2">
      <span
        className={`font-semibold ${
          queue.customer?.priority_type === "priority"
            ? theme.priorityColor
            : theme.normalColor
        }`}
      >
        #{queue.queue_number}
      </span>
      {queue.customer?.priority_type === "priority" && (
        <span
          className={`${theme.priorityBg} text-xs px-2 py-0.5 rounded-full`}
        >
          Priority
        </span>
      )}
    </div>
  </div>
));

QueueNumber.displayName = "QueueNumber";

const WaitingList = memo(({ waitingQueues = [], theme }) => {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  const handleMouseEnter = () => setShouldAnimate(false);
  const handleMouseLeave = () => setShouldAnimate(true);

  // Get maximum estimated wait time
  const maxWaitTime = Math.max(
    ...waitingQueues.map((queue) => queue.estimated_wait_time || 0),
    0
  );

  return (
    <div
      className={`${theme.cardBackground} rounded-xl shadow-lg overflow-hidden`}
    >
      {/* Header */}
      <div className={`${theme.banner} px-6 py-4`}>
        <h2 className="text-xl font-bold text-white flex items-center">
          <Users className="h-6 w-6 mr-3" />
          Waiting List
          <span
            className={`ml-3 text-sm ${theme.terminalBg} px-3 py-1 rounded-full`}
          >
            {waitingQueues.length} waiting
          </span>
        </h2>
      </div>

      {/* Content - Horizontal Scrolling */}
      <div className={`py-4 px-4 ${theme.waitingListBg}`}>
        {waitingQueues.length > 0 ? (
          <div
            className="overflow-x-auto pb-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`flex flex-nowrap min-w-full ${
                shouldAnimate && waitingQueues.length > 6
                  ? "animate-scroll-horizontal"
                  : ""
              }`}
              style={{ paddingBottom: "8px" }} /* For scrollbar padding */
            >
              {waitingQueues.map((queue) => (
                <QueueNumber key={queue.queue_id} queue={queue} theme={theme} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-6 text-gray-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>No customers waiting</span>
          </div>
        )}
      </div>

      {waitingQueues.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Estimated wait time: ~{maxWaitTime} minutes</span>
          </div>
        </div>
      )}
    </div>
  );
});

WaitingList.displayName = "WaitingList";

export default WaitingList;
