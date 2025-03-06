import React, { memo } from "react";
export const QueueNumbers = memo(({ waitingQueues }) => {
  if (!waitingQueues || waitingQueues.length === 0) {
    return (
      <span className="inline-block mx-4 px-6 py-3 text-gray-500 text-lg">
        No waiting queues at the moment
      </span>
    );
  }

  const renderQueue = (queue, isDuplicate = false) => (
    <span
      key={`${queue.queue_id}${isDuplicate ? "-dup" : ""}`}
      className="inline-flex items-center mx-4 px-6 py-3 bg-white border border-blue-100 rounded-lg shadow-sm"
    >
      <span className="text-2xl font-bold text-blue-600 mr-3">
        #{queue.queue_number}
      </span>
      {queue.customer.priority_type !== "regular" && (
        <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          Priority
        </span>
      )}
    </span>
  );

  return (
    <>
      {waitingQueues.map((queue) => renderQueue(queue))}
      {waitingQueues.map((queue) => renderQueue(queue, true))}
    </>
  );
});

QueueNumbers.displayName = "QueueNumbers";
