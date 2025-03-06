// src/components/dashboard/SkippedQueueList.jsx
import React from "react";
import { Clock } from "lucide-react";
import QueueCard from "./QueueCard";

const SkippedQueueList = ({ queues, onDelete, onSkip, onCallSkipped }) => {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Clock size={20} />
            Skipped Queues
          </h2>
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            {queues.length}
          </div>
        </div>

        <div className="space-y-4">
          {queues.length > 0 ? (
            queues.map((queue) => (
              <QueueCard
                key={queue.queue_id}
                queue={queue}
                isLoading={false}
                onDelete={() => onDelete(queue)}
                onSkip={() => onSkip(queue.queue_id)}
                onCallSkipped={() => onCallSkipped(queue.queue_id)}
                compact={true}
                showActions={true}
              />
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No skipped queues</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkippedQueueList;
