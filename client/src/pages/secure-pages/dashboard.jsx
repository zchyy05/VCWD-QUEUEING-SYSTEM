import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/authContext";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useQueueOperations } from "../../hooks/useQueueOperations";
import useQueueAnnouncement from "../../hooks/useQueueAnnouncement";
import { websocketService } from "../../services/websocketService";
import { AlertCircle, Loader2, WifiOff } from "lucide-react";

import DashboardHeader from "../../components/uiComponents/dashboardHeader";
import ActionButtons from "../../components/uiComponents/actionButtons";
import CurrentTransaction from "../../components/uiComponents/currentTransaction";
import QueueList from "../../components/queueList";
import SkippedQueueList from "../../components/skipQueueList";
import DeleteQueueDialog from "../../components/deleteDialog";
import EndTransactionDialog from "../../components/uiComponents/endTransaction";
import { announcementService } from "../../services/announcementService";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const [showConnectionError, setShowConnectionError] = useState(false);
  const previousTransactionRef = useRef(null);

  const {
    wsConnection,
    isConnected,
    error,
    setError,
    queueData,
    skippedQueues,
    currentTransaction,
    setCurrentTransaction,
  } = useWebSocket(user?.division?.division_id, user);

  const { reannounceTransaction } = useQueueAnnouncement(
    currentTransaction,
    previousTransactionRef.current,
    true
  );

  useEffect(() => {
    previousTransactionRef.current = currentTransaction;
  }, [currentTransaction]);

  const {
    isProcessing,
    accountNumber,
    setAccountNumber,
    isEndDialogOpen,
    setIsEndDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    queueToDelete,
    setQueueToDelete,
    handleDeleteClick,
    handleDeleteQueue,
    handleSkipQueue,
    handleNextTransaction,
    handleEndTransactionClick,
    handleEndTransaction,
    handleCallSkippedQueue,
  } = useQueueOperations(
    user,
    setError,
    setCurrentTransaction,
    currentTransaction
  );

  useEffect(() => {
    if (!user?.terminal_id || !user?.terminal_number) {
      navigate("/terminals");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isConnected) {
      setShowConnectionError(false);
    } else {
      const timer = setTimeout(() => {
        setShowConnectionError(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  // Create a wrapped version of handleEndTransactionClick that
  // sets the account number directly before opening the dialog
  const handleEndTransactionWithAccountNumber = () => {
    // Directly set the account number from current transaction if available
    if (currentTransaction?.account_number) {
      // Force update the account number in state
      setAccountNumber(currentTransaction.account_number);

      // Small delay to ensure state is updated before dialog opens
      setTimeout(() => {
        handleEndTransactionClick(currentTransaction);
      }, 50);
    } else {
      // No account number, just proceed normally
      setAccountNumber("");
      handleEndTransactionClick(currentTransaction);
    }
  };

  // Backup method: whenever the end dialog opens, ensure account number is set
  useEffect(() => {
    if (isEndDialogOpen && currentTransaction?.account_number) {
      setAccountNumber(currentTransaction.account_number);
    }
  }, [isEndDialogOpen, currentTransaction, setAccountNumber]);

  const displayError = error && !error.includes("WebSocket") ? error : null;

  // Additional debug logging to track state
  useEffect(() => {
    if (currentTransaction?.account_number) {
      console.log(
        "Current transaction has account number:",
        currentTransaction.account_number
      );
    }
  }, [currentTransaction]);

  useEffect(() => {
    console.log("Current account number state:", accountNumber);
  }, [accountNumber]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} signout={signOut} />

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-3 mb-6">
          {showConnectionError && !isConnected && (
            <div
              className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl 
                          flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                <WifiOff size={20} className="text-amber-500" />
                <span className="font-medium">Connecting to server...</span>
              </div>
              <Loader2 size={20} className="animate-spin text-amber-500" />
            </div>
          )}

          {displayError && (
            <div
              className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl 
                          flex items-center gap-2 shadow-sm"
            >
              <AlertCircle size={20} className="text-red-500" />
              <span className="font-medium">{displayError}</span>
            </div>
          )}
        </div>

        <div className="mb-8 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <ActionButtons
              onEndClick={handleEndTransactionWithAccountNumber}
              onNextClick={handleNextTransaction}
              currentTransaction={currentTransaction}
              isProcessing={isProcessing}
              terminalNumber={user?.terminal_number}
            />
          </div>

          <CurrentTransaction
            transaction={currentTransaction}
            onSkip={handleSkipQueue}
            onCallAgain={reannounceTransaction}
            isProcessing={isProcessing}
          />
        </div>

        {/* Queue Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <QueueList
            queues={queueData}
            isConnected={isConnected}
            onDelete={handleDeleteClick}
            onSkip={handleSkipQueue}
            title="Queue Management"
            waitingCount={queueData?.length || 0}
          />

          <SkippedQueueList
            queues={skippedQueues}
            onDelete={handleDeleteClick}
            onSkip={handleSkipQueue}
            onCallSkipped={handleCallSkippedQueue}
          />
        </div>
      </main>

      {/* Dialogs */}
      <DeleteQueueDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setQueueToDelete(null);
        }}
        onConfirm={() => handleDeleteQueue(queueToDelete?.queue_id)}
        queueNumber={queueToDelete?.queue_number}
        isProcessing={isProcessing}
      />

      <EndTransactionDialog
        isOpen={isEndDialogOpen}
        onClose={() => setIsEndDialogOpen(false)}
        onConfirm={handleEndTransaction}
        accountNumber={accountNumber}
        setAccountNumber={setAccountNumber}
        isProcessing={isProcessing}
        currentTransaction={currentTransaction}
      />
    </div>
  );
};

export default Dashboard;
