import { useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const publicRoutes = ["/", "/view", "/auth/signin", "/auth/signup"];
      const currentPath = window.location.pathname;

      if (!publicRoutes.includes(currentPath)) {
        setUser(null);
        localStorage.clear();
        if (error.response.data?.code === "TOKEN_EXPIRED") {
          navigate("/auth/signin?expired=true");
        } else {
          navigate("/auth/signin");
        }
      }
    }
    return Promise.reject(error);
  }
);

export const useQueueOperations = (
  user,
  setError,
  setCurrentTransaction,
  currentTransaction
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [queueToDelete, setQueueToDelete] = useState(null);

  const handleError = (error, defaultMessage) => {
    if (error.response?.status !== 401) {
      console.error(defaultMessage, error);
      setError(error?.response?.data?.message || defaultMessage);
    }
    setIsProcessing(false);
  };

  const handleDeleteClick = (queue) => {
    const queueToDeleteId = typeof queue === "object" ? queue.queue_id : queue;
    setQueueToDelete({ queue_id: queueToDeleteId });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteQueue = async (queueId) => {
    if (!queueId || !user?.division?.division_id) {
      setError("Invalid queue or division");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await api.delete(`/queue/deleteQueue`, {
        data: {
          queue_id: queueId,
          division_id: user.division.division_id,
        },
      });

      if (response?.data?.message?.includes("successfully")) {
        setError(null);
      } else {
        setError(response?.data?.message || "Failed to delete queue");
      }
    } catch (error) {
      handleError(error, "Failed to delete queue. Please try again.");
    } finally {
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
      setQueueToDelete(null);
    }
  };

  const handleSkipQueue = async (queueId) => {
    if (!queueId || !user?.division?.division_id || !user?.user_id) {
      setError("Invalid queue or division");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await api.post(`/queue/skipQueue`, {
        queue_id: queueId,
        division_id: user.division.division_id,
      });

      if (response?.data?.message?.includes("successfully")) {
        if (currentTransaction && currentTransaction.queue_id === queueId) {
          setCurrentTransaction(null);
        }
        setError(null);
      } else {
        setError(response?.data?.message || "Failed to skip queue");
      }
    } catch (error) {
      handleError(error, "Failed to skip queue. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextTransaction = async () => {
    if (
      !user?.division?.division_id ||
      !user?.user_id ||
      !user?.terminal_id ||
      !user?.terminal_number
    ) {
      console.log("Missing required data:", {
        division_id: user?.division?.division_id,
        user_id: user?.user_id,
        terminal_id: user?.terminal_id,
        terminal_number: user?.terminal_number,
      });
      setError("Missing required terminal information");
      return;
    }

    try {
      setIsProcessing(true);
      const params = {
        user_id: parseInt(user.user_id),
        terminal_id: parseInt(user.terminal_id),
        terminal_number: parseInt(user.terminal_number),
      };

      const response = await api.post(
        `/queue/next/${user.division.division_id}`,
        params
      );

      const result = response.data;
      if (result.queue) {
        setCurrentTransaction(result.queue);
        setError(null);
        return result.queue;
      } else {
        setError(result.message || "No queue data received from server");
      }
    } catch (error) {
      console.error("Next transaction error:", {
        error: error.response?.data || error,
        status: error.response?.status,
      });
      handleError(error, "Failed to process next transaction");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndTransactionClick = (currentTransaction) => {
    if (!currentTransaction) {
      setError("No active transaction to end");
      return;
    }
    setIsEndDialogOpen(true);
  };

  const handleCallSkippedQueue = async (queue_id) => {
    if (!queue_id || !user?.division?.division_id || !user?.user_id) {
      setError("Invalid queue, division, or user");
      return;
    }

    if (currentTransaction) {
      setError(
        "Please end your current transaction before calling another queue"
      );
      return;
    }

    try {
      setIsProcessing(true);
      const response = await api.post(`/queue/call-skipped`, {
        queue_id: queue_id,
        division_id: user.division.division_id,
        user_id: user.user_id,
        terminal_id: user.terminal_id,
        terminal_number: user.terminal_number,
      });

      if (response?.data?.queue) {
        const formattedQueue = {
          queue_id: response.data.queue.queue_id,
          queue_number: response.data.queue.queue_number,
          customer_name: response.data.queue.customer_name || "N/A",
          priority_type: response.data.queue.priority_type || "regular",
          status: "In Progress",
        };
        setCurrentTransaction(formattedQueue);
        setError(null);
        return formattedQueue;
      } else {
        setError("Failed to call skipped queue");
      }
    } catch (err) {
      handleError(err, "Failed to call skipped queue. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndTransaction = async () => {
    if (!currentTransaction) {
      setError("No active transaction to end");
      return;
    }

    if (!user?.user_id) {
      setError("User ID is required");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await api.post("/queue/end-transaction", {
        user_id: user.user_id,
        account_number: accountNumber,
      });

      setIsEndDialogOpen(false);
      setAccountNumber("");
      setCurrentTransaction(null);
    } catch (error) {
      handleError(error, "Failed to end transaction");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
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
  };
};
