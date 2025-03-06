// websocketService.ts
function createWebSocketService() {
  // Constants
  const INITIAL_RECONNECT_DELAY = 500;
  const MAX_RECONNECT_DELAY = 3000;
  const CONNECTION_TIMEOUT = 3000;
  const MAX_RECONNECT_ATTEMPTS = 5;

  // State
  let ws = null;
  let subscribers = new Map();
  let reconnectAttempts = 0;
  let isConnecting = false;
  let currentDivisionId = null;
  let connectionTimeout = null;

  // Save WebSocket to window for direct access
  // This is critical for our direct event listener approach
  const saveWsReference = (websocket) => {
    try {
      window._wsConnection = websocket;
    } catch (e) {
      console.error("Failed to save WebSocket reference to window", e);
    }
  };

  // Message Queue Implementation
  function createMessageQueue() {
    let queue = [];
    let processing = false;

    async function process() {
      if (processing || queue.length === 0) return;
      processing = true;

      while (queue.length > 0) {
        const callbacks = queue.splice(0, 10);
        await Promise.all(callbacks.map((cb) => cb()));
      }

      processing = false;
    }

    function add(message) {
      queue.push(message);
      if (!processing) {
        process();
      }
    }

    return { add };
  }

  const messageQueue = createMessageQueue();

  function notifySubscribers(data) {
    subscribers.forEach((callback) => callback(data));
  }

  function clearConnectionTimeout() {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }
  }

  function handleReconnect() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && currentDivisionId) {
      reconnectAttempts++;
      const delay = Math.min(
        INITIAL_RECONNECT_DELAY * Math.pow(1.5, reconnectAttempts),
        MAX_RECONNECT_DELAY
      );

      setTimeout(() => {
        if (currentDivisionId) initializeWebSocket();
      }, delay);
    }
  }

  function initializeWebSocket() {
    try {
      isConnecting = true;

      const wsUrl = new URL(import.meta.env.VITE_API_URL);
      const wsProtocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
      const fullWsUrl = `${wsProtocol}//${wsUrl.host}/ws`;

      if (ws) ws.close(1000, "New connection requested");

      ws = new WebSocket(fullWsUrl);

      // Save WebSocket reference to window
      saveWsReference(ws);

      clearConnectionTimeout();
      connectionTimeout = setTimeout(() => {
        if (ws?.readyState !== WebSocket.OPEN) {
          ws?.close();
          handleReconnect();
        }
      }, CONNECTION_TIMEOUT);

      ws.onopen = handleOpen;
      ws.onmessage = handleMessage;
      ws.onclose = handleClose;
      ws.onerror = handleError;
    } catch (error) {
      console.error("WebSocket connection error:", error);
      clearConnectionTimeout();
      isConnecting = false;
      handleReconnect();
    }
  }

  function handleOpen() {
    clearConnectionTimeout();
    isConnecting = false;
    reconnectAttempts = 0;

    if (ws?.readyState === WebSocket.OPEN && currentDivisionId) {
      ws.send(
        JSON.stringify({
          type: "SUBSCRIBE_DIVISION",
          data: { division_id: currentDivisionId },
        })
      );
    }

    messageQueue.add(async () =>
      notifySubscribers({
        type: "CONNECTION_STATUS",
        data: { connected: true, timestamp: new Date() },
      })
    );
  }

  function handleMessage(event) {
    try {
      const data = JSON.parse(event.data);

      // Special handling for custom messages
      if (data.type === "TRANSACTION_ANNOUNCED") {
        console.log("Received transaction announcement via WebSocket:", data);
        // Make sure this important message gets to subscribers immediately
        notifySubscribers(data);
      }

      messageQueue.add(async () => notifySubscribers(data));
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  function handleClose(event) {
    clearConnectionTimeout();
    isConnecting = false;
    window._wsConnection = null;

    messageQueue.add(async () =>
      notifySubscribers({
        type: "CONNECTION_STATUS",
        data: { connected: false, timestamp: new Date() },
      })
    );

    if (event.code !== 1000) handleReconnect();
  }

  function handleError(error) {
    console.error("WebSocket Error:", error);
    clearConnectionTimeout();
    isConnecting = false;
    handleReconnect();
  }

  // Send a message through the WebSocket
  function send(message) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected, cannot send message");
      return false;
    }

    try {
      // If this is a custom message type that we want to handle specially
      if (typeof message === "object") {
        // For custom message types like TRANSACTION_ANNOUNCED
        if (message.type === "TRANSACTION_ANNOUNCED") {
          console.log("Sending transaction announcement:", message);
        }

        // Stringify if it's an object
        if (typeof message !== "string") {
          message = JSON.stringify(message);
        }
      }

      ws.send(message);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  // Public API
  function connect(division_id) {
    if (isConnecting) return api;
    currentDivisionId = division_id || null;
    initializeWebSocket();
    return api;
  }

  function subscribe(callback) {
    const id = Math.random().toString(36).substr(2, 9);
    subscribers.set(id, callback);
    return id;
  }

  function unsubscribe(id) {
    subscribers.delete(id);
  }

  function disconnect() {
    clearConnectionTimeout();
    currentDivisionId = null;
    if (ws) {
      ws.close(1000, "Client disconnecting normally");
      ws = null;
      window._wsConnection = null;
    }
    subscribers.clear();
    isConnecting = false;
    reconnectAttempts = 0;
  }

  function isConnected() {
    return ws && ws.readyState === WebSocket.OPEN;
  }

  function getWebSocket() {
    return ws;
  }

  const api = {
    connect,
    subscribe,
    unsubscribe,
    disconnect,
    isConnected,
    send,
    getWebSocket,
  };

  return api;
}

// Create and export the service instance
export const websocketService = createWebSocketService();
export default websocketService;
