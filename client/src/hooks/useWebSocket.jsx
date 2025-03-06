// useWebSocket.js
import { useState, useEffect } from "react";
import { websocketService } from "../services/websocketService";
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
    if (error.response?.data?.code === "TOKEN_EXPIRED") {
      Cookies.remove("token");
      localStorage.clear();
      window.location.href = "/login?expired=true";
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      localStorage.clear();
      Cookies.remove("token");
      window.location.href = "/auth/signin";
    }
    return Promise.reject(error);
  }
);

export const useWebSocket = (divisionId, user) => {
  const [wsConnection, setWsConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [skippedQueues, setSkippedQueues] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchCurrentTransaction = async () => {
    if (!divisionId || !user?.terminal_id || !user?.terminal_number) {
      console.log("Missing required data:", { divisionId, user });
      return;
    }

    try {
      // console.log("Fetching current transaction with params:", {
      //   divisionId,
      //   terminal_id: user.terminal_id,
      //   terminal_number: user.terminal_number,
      //   timestamp: new Date().toISOString(),
      // });

      const response = await api.get(
        `/queue/current-transaction/${divisionId}`,
        {
          params: {
            terminal_id: user.terminal_id,
            terminal_number: user.terminal_number,
          },
        }
      );

      console.log("Current transaction API response:", {
        data: response.data,
        timestamp: new Date().toISOString(),
      });

      if (response.data.current_transaction) {
        console.log("Setting current transaction:", {
          transaction: response.data.current_transaction,
          terminal_id: response.data.current_transaction.terminal_id,
          user_terminal_id: user.terminal_id,
          timestamp: new Date().toISOString(),
        });
        setCurrentTransaction(response.data.current_transaction);
      } else {
        console.log("No current transaction found, setting to null", {
          timestamp: new Date().toISOString(),
        });
        setCurrentTransaction(null);
      }
    } catch (err) {
      console.error("Error fetching current transaction:", {
        error: err.response?.data || err,
        timestamp: new Date().toISOString(),
      });
      setCurrentTransaction(null);
    }
  };

  const handleQueueUpdate = (data) => {
    if (!data?.data) {
      console.log("Received empty queue update data");
      return;
    }

    // console.log("Processing queue update:", {
    //   type: data.type,
    //   data: data.data,
    //   timestamp: new Date().toISOString(),
    // });

    if (data.data.queues) {
      const formattedQueues = data.data.queues
        .map((queue) => ({
          queue_id: queue.queue_id,
          queue_number: queue.queue_number,
          customer_name:
            queue.customer?.customer_name || queue.customer_name || "N/A",
          account_number:
            queue.customer?.account_number || queue.account_number || "N/A",
          priority_type:
            queue.customer?.priority_type || queue.priority_type || "regular",
          priority_level: queue.priority_level || 1,
          position: queue.position || 0,
          created_at: queue.created_at,
          status: queue.status,
          is_skipped: queue.is_skipped || false,
          terminal_id: queue.terminal_id,
          terminal_number: queue.terminal_number,
        }))
        .sort((a, b) => a.position - b.position);

      // console.log("Queue update details:", {
      //   regular: formattedQueues.filter((q) => !q.is_skipped),
      //   skipped: formattedQueues.filter((q) => q.is_skipped),
      //   currentUserTerminal: user?.terminal_id,
      //   timestamp: new Date().toISOString(),
      // });

      setQueueData(formattedQueues.filter((q) => !q.is_skipped));
      setSkippedQueues(formattedQueues.filter((q) => q.is_skipped));
    }

    if (data.data.current_queue) {
      // console.log("Received current queue update:", {
      //   queue: data.data.current_queue,
      //   queue_terminal: data.data.terminal_id,
      //   user_terminal: user?.terminal_id,
      //   terminal_match: data.data.terminal_id === user?.terminal_id,
      //   timestamp: new Date().toISOString(),
      // });

      if (data.data.terminal_id === user?.terminal_id) {
        const updatedQueue = {
          ...data.data.current_queue,
          terminal_id: user.terminal_id,
          terminal_number: user.terminal_number,
        };
        setCurrentTransaction(updatedQueue);
        console.log("Updated current transaction:", {
          queue: updatedQueue,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  useEffect(() => {
    if (!divisionId || !user?.terminal_id || !user?.terminal_number) {
      console.log("Missing required data for WebSocket connection");
      return;
    }

    let subscriptionId;
    let connection;
    let reconnectTimer;

    const initializeWebSocket = async () => {
      try {
        // console.log("Initializing WebSocket connection", {
        //   divisionId,
        //   terminal_id: user.terminal_id,
        //   terminal_number: user.terminal_number,
        //   timestamp: new Date().toISOString(),
        // });

        connection = websocketService.connect(divisionId, {
          terminal_id: user.terminal_id,
          terminal_number: user.terminal_number,
        });

        setWsConnection(connection);
        setError(null);

        subscriptionId = connection.subscribe((data) => {
          // console.log("WebSocket message received:", {
          //   type: data.type,
          //   timestamp: new Date().toISOString(),
          // });

          switch (data.type) {
            case "CONNECTION_ACK":
              console.log("Connection acknowledged by server");
              setIsConnected(true);
              fetchCurrentTransaction();
              break;

            case "QUEUE_UPDATE":
              handleQueueUpdate(data);
              break;

            case "TRANSACTION_COMPLETED":
              console.log("Transaction completed:", {
                data: data.data,
                terminal_match: data.data.terminal_id === user.terminal_id,
                timestamp: new Date().toISOString(),
              });
              if (data.data.terminal_id === user.terminal_id) {
                setCurrentTransaction(null);
                fetchCurrentTransaction();
              }
              break;

            default:
              console.log("Unknown message type:", {
                type: data.type,
                data: data.data,
                timestamp: new Date().toISOString(),
              });
          }
        });
      } catch (error) {
        console.error("WebSocket initialization error:", {
          error,
          divisionId,
          terminal: user?.terminal_id,
          timestamp: new Date().toISOString(),
        });
        setError("Failed to initialize dashboard");
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(initializeWebSocket, 5000);
      }
    };

    initializeWebSocket();

    return () => {
      console.log("Cleaning up WebSocket connection");
      if (connection) {
        websocketService.unsubscribe(subscriptionId);
        websocketService.disconnect();
        setWsConnection(null);
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [divisionId, user]);

  useEffect(() => {
    if (!divisionId || !user?.terminal_id || !user?.terminal_number) return;

    console.log("Setting up periodic refresh");
    const refreshInterval = setInterval(() => {
      console.log("Executing periodic refresh", {
        timestamp: new Date().toISOString(),
      });
      fetchCurrentTransaction();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [divisionId, user]);

  return {
    wsConnection,
    isConnected,
    error,
    setError,
    queueData,
    skippedQueues,
    currentTransaction,
    setCurrentTransaction,
    fetchCurrentTransaction,
    isInitialLoad,
  };
};
