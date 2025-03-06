import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const api_url = import.meta.env.VITE_API_URL;

const DivisionsContext = createContext();

// Create axios instance with consistent configuration
const api = axios.create({
  baseURL: api_url,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Handle auth errors globally
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

const handleError = (error) => {
  if (axios.isAxiosError(error)) {
    // Don't throw for 401 errors as they're handled by the interceptor
    if (error.response?.status !== 401) {
      const message = error.response?.data?.message || "An error occurred";
      throw new Error(message);
    }
  }
  throw error instanceof Error ? error : new Error("An unknown error occurred");
};

export const DivisionsProvider = ({ children }) => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllDivisions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/division/get-division");
      setDivisions(response.data.divisions);
      return response.data.divisions;
    } catch (error) {
      if (error.response?.status !== 401) {
        const errorMessage = handleError(error);
        setError(errorMessage);
        throw errorMessage;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllDivisions().catch((error) => {
      if (error.response?.status !== 401) {
        console.error("Failed to fetch divisions:", error);
      }
    });
  }, []);

  const value = {
    divisions,
    loading,
    error,
    getAllDivisions,
    setDivisions,
  };

  return (
    <DivisionsContext.Provider value={value}>
      {children}
    </DivisionsContext.Provider>
  );
};

export const useDivisions = () => {
  const context = useContext(DivisionsContext);
  if (!context) {
    throw new Error("useDivisions must be used within a DivisionsProvider");
  }
  return context;
};
