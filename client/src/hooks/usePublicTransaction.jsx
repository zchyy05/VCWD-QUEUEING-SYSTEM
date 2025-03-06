import { useState, useEffect, useCallback } from "react";
import { websocketService } from "../services/websocketService";
import axios from "axios";

const REFRESH_INTERVAL = 3000;
const RECONNECT_DELAY = 2000;

export const usePublicTransaction = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [waitingQueues, setWaitingQueues] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [wsConnection, setWsConnection] = useState(null);

  const fetchAllInProgressTransactions = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/queue/in-progress`
      );

      if (response.data.status === "success") {
        setAllTransactions((prev) => {
          const newData = response.data.data.transactions;
          // console.log("Fetched transactions:", newData);
          if (JSON.stringify(prev) !== JSON.stringify(newData)) {
            return newData;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions");
    }
  }, []);

  const fetchWaitingQueues = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/queue/waiting`
      );
      if (response.data.status === "success") {
        setWaitingQueues((prev) => {
          const newData = response.data.data.queues;
          // console.log("Fetched waiting queues:", newData);
          if (JSON.stringify(prev) !== JSON.stringify(newData)) {
            return newData;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Error fetching waiting queues:", err);
    }
  }, []);

  const handleTransactionUpdate = useCallback(async () => {
    // console.log("Handling transaction update");
    await Promise.all([fetchAllInProgressTransactions(), fetchWaitingQueues()]);
  }, [fetchAllInProgressTransactions, fetchWaitingQueues]);

  useEffect(() => {
    Promise.all([
      fetchAllInProgressTransactions(),
      fetchWaitingQueues(),
    ]).finally(() => setIsInitialLoad(false));
  }, [fetchAllInProgressTransactions, fetchWaitingQueues]);

  useEffect(() => {
    let subscriptionId;
    let connection;
    let reconnectTimer;
    let isSubscribed = true;

    const initializeWebSocket = () => {
      try {
        if (!isSubscribed) return;

        connection = websocketService.connect();
        setWsConnection(connection);
        setError(null);

        subscriptionId = connection.subscribe((data) => {
          if (!isSubscribed) return;

          // console.log("WebSocket message received:", data.type, data);

          switch (data.type) {
            case "CONNECTION_ACK":
            case "CONNECTION_STATUS":
              if (data.data && data.data.connected !== undefined) {
                setIsConnected(data.data.connected);
              } else {
                setIsConnected(true);
              }
              handleTransactionUpdate();
              break;

            case "TRANSACTION_UPDATE":
              if (Array.isArray(data.data?.transactions)) {
                // console.log(
                //   "Updating transactions from websocket:",
                //   data.data.transactions
                // );
                setAllTransactions(data.data.transactions);
              }
              break;

            case "WAITING_QUEUES_UPDATE":
              if (Array.isArray(data.data?.queues)) {
                // console.log(
                //   "Updating queues from websocket:",
                //   data.data.queues
                // );
                setWaitingQueues((prev) => {
                  const newData = data.data.queues;
                  if (JSON.stringify(prev) !== JSON.stringify(newData)) {
                    return newData;
                  }
                  return prev;
                });
              }
              break;

            case "TRANSACTION_COMPLETED":
            case "TRANSACTION_STARTED":
            case "QUEUE_UPDATE":
              handleTransactionUpdate();
              break;

            // Add handling for the TRANSACTION_ANNOUNCED message type
            case "TRANSACTION_ANNOUNCED":
              console.log("Received transaction announcement:", data);
              break;

            default:
              console.log("Unknown message type:", data.type);
          }
        });

        // If your WebSocket API supports it, request initial data
        if (connection.isConnected()) {
          websocketService.send({
            type: "GET_ALL_WAITING_QUEUES",
          });
        }
      } catch (error) {
        console.error("WebSocket initialization error:", error);
        if (isSubscribed) {
          setError("Connection lost, reconnecting...");
          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(initializeWebSocket, RECONNECT_DELAY);
        }
      }
    };

    initializeWebSocket();

    return () => {
      isSubscribed = false;
      if (connection) {
        websocketService.unsubscribe(subscriptionId);
        websocketService.disconnect();
        setWsConnection(null);
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [handleTransactionUpdate]);

  useEffect(() => {
    const refreshInterval = setInterval(
      handleTransactionUpdate,
      REFRESH_INTERVAL
    );
    return () => clearInterval(refreshInterval);
  }, [handleTransactionUpdate]);

  return {
    isConnected,
    error,
    allTransactions,
    waitingQueues,
    isInitialLoad,
    wsConnection,
    // Expose the websocketService to components
    websocketService,
  };
};
