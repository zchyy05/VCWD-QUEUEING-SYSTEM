// src/components/dashboard/QueueList.jsx
import React from "react";
import QueueCard from "./QueueCard";
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
const QueueList = ({
  queues,
  isConnected,
  onDelete,
  onSkip,
  title,
  waitingCount,
  className = "lg:col-span-3",
}) => {
  return (
    <div className={className}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {waitingCount !== undefined && (
                <div
                  className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 
                              rounded-full font-medium text-sm ring-1 ring-blue-600/20"
                >
                  <Users size={16} />
                  <span>Waiting: {waitingCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isConnected ? (
              Array.from({ length: 6 }).map((_, index) => (
                <QueueCard key={index} isLoading={true} />
              ))
            ) : queues.length > 0 ? (
              queues.map((queue) => (
                <QueueCard
                  key={queue.queue_id}
                  queue={queue}
                  isLoading={false}
                  onDelete={() => onDelete(queue.queue_id)}
                  onSkip={() => onSkip(queue.queue_id)}
                  showActions={true}
                />
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <AlertCircle size={24} className="text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-500">
                  No Queue Available
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Queue items will appear here when available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueList;
