import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href =
        error.response.data?.code === "TOKEN_EXPIRED"
          ? "/login?expired=true"
          : "/login";
    }
    return Promise.reject(error);
  }
);

const normalizeQueueData = (queues) => {
  if (!Array.isArray(queues)) return [];

  return queues.map((queue) => ({
    queue_id: queue.queue_id,
    queue_number: queue.queue_number,
    customer_name: queue.customer?.customer_name ?? "N/A",
    account_number: queue.customer?.account_number ?? "N/A",
    priority_type: queue.customer?.priority_type ?? "regular",
    priority_level: queue.priority_level ?? 1,
    position: queue.position ?? 0,
    created_at: queue.created_at,
    status: queue.status,
    division_name: queue.division?.division_name ?? "N/A",
  }));
};

const handleApiError = (error) => {
  if (error.response?.status !== 401) {
    const message = error.response?.data?.message ?? "An error occurred";
    throw new Error(message);
  }
};

const normalizeResponse = (response) => {
  if (response.data.queue) {
    response.data.queue = normalizeQueueData([response.data.queue])[0];
  }
  if (response.data.transaction?.queue) {
    response.data.transaction.queue = normalizeQueueData([
      response.data.transaction.queue,
    ])[0];
  }
  return response.data;
};

export const getDivisionsQueue = async (division_id) => {
  try {
    const response = await api.get(`/queue/getDivisionQueues/${division_id}`);
    if (response.data.status === "success" && response.data.data.queues) {
      response.data.data.queues = normalizeQueueData(response.data.data.queues);
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const createQueue = async (customerData) => {
  try {
    const queueData = {
      customer_name: customerData.customer_name,
      account_number: customerData.account_number,
      division_id: customerData.division_id,
      priority_type: customerData.priority_type || "regular",
    };
    const response = await api.post("/queue", queueData);
    return normalizeResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const nextQueue = async (division_id, user_id, user) => {
  try {
    const response = await api.post("/queue/next", {
      division_id,
      user_id,
      terminal_id: user.terminal_id,
      terminal_number: user.terminal_number,
    });
    return normalizeResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const endTransaction = async (user_id, account_number, user) => {
  try {
    const response = await api.post("/queue/end-transaction", {
      user_id,
      account_number,
      terminal_id: user.terminal_id,
      terminal_number: user.terminal_number,
    });
    return normalizeResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const skipQueue = async (queue_id, division_id, user) => {
  try {
    const response = await api.post("/queue/skipQueue", {
      queue_id,
      division_id,
      terminal_id: user.terminal_id,
      terminal_number: user.terminal_number,
    });
    return normalizeResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const callSkipped = async (queueId, divisionId, userId, user) => {
  try {
    const response = await api.post("/queue/call-skipped", {
      queue_id: queueId,
      division_id: divisionId,
      user_id: userId,
      terminal_id: user.terminal_id,
      terminal_number: user.terminal_number,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteQueue = async (queue_id, division_id, user) => {
  try {
    const response = await api.post("/queue/deleteQueue", {
      queue_id,
      division_id,
      terminal_id: user.terminal_id,
      terminal_number: user.terminal_number,
    });
    return normalizeResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};
