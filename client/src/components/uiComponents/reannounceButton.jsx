import React from "react";
import { Volume2 } from "lucide-react";
import { useAnnouncement } from "../../context/announcementContext";

const ReannounceButton = ({
  currentTransaction,
  onReannounce,
  isProcessing,
}) => {
  const { isAnnouncing } = useAnnouncement();

  const hasActiveTransaction =
    currentTransaction &&
    currentTransaction.status === "In Progress" &&
    currentTransaction.queue_number &&
    currentTransaction.terminal_number;

  return (
    <button
      onClick={onReannounce}
      disabled={isProcessing || isAnnouncing || !hasActiveTransaction}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
        ${
          hasActiveTransaction && !isAnnouncing && !isProcessing
            ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
        }
        transition-colors
      `}
      title={
        !hasActiveTransaction
          ? "No active transaction to announce"
          : isAnnouncing
          ? "Announcement in progress"
          : "Reannounce current queue"
      }
    >
      <Volume2 size={18} className={isAnnouncing ? "animate-pulse" : ""} />
      {isAnnouncing ? "Announcing..." : "Reannounce Queue"}
    </button>
  );
};

export default ReannounceButton;
