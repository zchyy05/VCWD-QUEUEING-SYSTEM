// useTerminal.js
import { useState, useEffect } from "react";
import axios from "axios";

export const useTerminal = () => {
  const api_url = import.meta.env.VITE_API_URL;
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const axiosInstance = axios.create({
    baseURL: api_url,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.response.use(
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

  const handleError = (err, defaultMessage) => {
    if (err.response?.status !== 401) {
      const errorMessage = err.response?.data?.message || defaultMessage;
      setError(errorMessage);
      console.error(defaultMessage, err);
    }
    throw err;
  };

  const fetchAllTerminals = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/terminal/terminals");
      setTerminals(response.data.terminals);
      setError(null);
      return response.data.terminals;
    } catch (err) {
      handleError(err, "Error fetching terminals");
    } finally {
      setLoading(false);
    }
  };

  const createTerminal = async (terminalData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/terminal/create", {
        division_id: Number(terminalData.division_id),
        terminalCount: Number(terminalData.terminalCount),
      });
      await fetchAllTerminals();
      return response.data;
    } catch (err) {
      handleError(err, "Error creating terminal");
    } finally {
      setLoading(false);
    }
  };

  const updateTerminal = async (terminal_id, terminalData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/terminal/updateTerminal/${terminal_id}`,
        {
          division_id: Number(terminalData.division_id),
          terminalNumber: Number(terminalData.terminalNumber),
        }
      );
      await fetchAllTerminals();
      return response.data;
    } catch (err) {
      handleError(err, "Error updating terminal");
    } finally {
      setLoading(false);
    }
  };

  const deleteTerminal = async (terminal_id) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/terminal/deleteTerminal/${terminal_id}`);
      await fetchAllTerminals();
    } catch (err) {
      handleError(err, "Error deleting terminal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTerminals();
  }, []);

  return {
    terminals,
    loading,
    error,
    createTerminal,
    updateTerminal,
    deleteTerminal,
    refreshTerminals: fetchAllTerminals,
  };
};
