import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable sending cookies
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();

      window.location.href = "/auth/signin";
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

const handleError = (err, defaultMessage) => {
  const errorMessage = err.response?.data?.message || defaultMessage;
  if (err.response?.status !== 401) {
    console.error(defaultMessage, err);
  }
  throw err;
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/user/me");
    return response.data;
  } catch (error) {
    return handleError(error, "Error fetching user");
  }
};

export const updateUser = async (userData) => {
  try {
    const response = await api.put("/user/update", userData);
    return response.data;
  } catch (error) {
    return handleError(error, "Error updating user");
  }
};

export default api;
