import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const useCustomer = () => {
  const api_url = import.meta.env.VITE_API_URL;
  const [customers, setCustomers] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  const axiosInstance = axios.create({
    baseURL: api_url,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        const publicRoutes = ["/", "/view", "/auth/signin", "/auth/signup"];
        const currentPath = window.location.pathname;

        if (!publicRoutes.includes(currentPath)) {
          localStorage.clear();
          if (error.response.data?.code === "TOKEN_EXPIRED") {
            window.location.href = "/auth/signin?expired=true";
          } else {
            window.location.href = "/auth/signin";
          }
        }
      }
      return Promise.reject(error);
    }
  );

  const fetchCustomers = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const {
        page = 1,
        limit = 10,
        searchTerm = "",
        priorityType,
        sortBy,
        sortOrder,
      } = params;

      const response = await axiosInstance.get("/customer/customers", {
        params: {
          page,
          limit,
          searchTerm,
          priorityType,
          sortBy,
          sortOrder,
        },
      });

      setCustomers(response.data.data || []);
      setPagination(
        response.data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        }
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.response?.data?.message || "Error fetching customers");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    // Don't proceed if customerId is invalid
    if (!customerId || isNaN(parseInt(customerId))) {
      setError("Invalid customer ID");
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `/customer/customers/${customerId}`
      );
      setCustomerDetails(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setError(
        err.response?.data?.message || "Error fetching customer details"
      );
      setCustomerDetails(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerHistory = async (customerId, params = {}) => {
    // Don't proceed if customerId is invalid
    if (!customerId || isNaN(parseInt(customerId))) {
      setError("Invalid customer ID");
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const { page = 1, limit = 10 } = params;

      const response = await axiosInstance.get(
        `/customer/customers/${customerId}/queue-history`,
        {
          params: { page, limit },
        }
      );

      setCustomerHistory(response.data.data || []);
      setPagination(
        response.data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        }
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching customer history:", err);
      setError(
        err.response?.data?.message || "Error fetching customer history"
      );
      setCustomerHistory([]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(
        "/customer/customers/search",
        searchParams
      );
      setCustomers(response.data.data || []);
      return response.data;
    } catch (err) {
      console.error("Error searching customers:", err);
      setError(err.response?.data?.message || "Error searching customers");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchCustomers();
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, []);

  return {
    customers,
    customerDetails,
    customerHistory,
    loading,
    error,
    pagination,
    fetchCustomers,
    fetchCustomerDetails,
    fetchCustomerHistory,
    searchCustomers,
    refreshData,
  };
};
