import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const useAnalytics = () => {
  const api_url = import.meta.env.VITE_API_URL;
  const [analyticsData, setAnalyticsData] = useState(null);
  const [serviceTrends, setServiceTrends] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userPerformance, setUserPerformance] = useState(null);
  const [peakHours, setPeakHours] = useState(null);
  const [waitTimeStats, setWaitTimeStats] = useState(null);
  const [divisionStats, setDivisionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchAnalyticsOverview = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/analytics/overview");
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching analytics overview"
      );
      if (err.response?.status !== 401) {
        console.error("Error fetching analytics overview:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceTrends = async () => {
    try {
      const response = await axiosInstance.get("/analytics/service-trends");
      setServiceTrends(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching service trends");
      if (err.response?.status !== 401) {
        console.error("Error fetching service trends:", err);
      }
    }
  };

  const fetchUserAverageTime = async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/analytics/user-average-time/${userId}`
      );
      setUserStats(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching user statistics");
      if (err.response?.status !== 401) {
        console.error("Error fetching user statistics:", err);
      }
      throw err;
    }
  };

  // New analytics functions
  const fetchUserPerformance = async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/analytics/user-performance/${userId}`
      );
      setUserPerformance(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching user performance"
      );
      throw err;
    }
  };

  const fetchPeakHours = async () => {
    try {
      const response = await axiosInstance.get("/analytics/peak-hours");
      setPeakHours(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching peak hours");
      throw err;
    }
  };

  const fetchWaitTimeAnalytics = async () => {
    try {
      const response = await axiosInstance.get("/analytics/wait-time");
      setWaitTimeStats(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching wait time analytics"
      );
      throw err;
    }
  };

  const fetchDivisionQueueStats = async () => {
    try {
      const response = await axiosInstance.get(
        "/analytics/division-queue-stats"
      );
      setDivisionStats(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching division stats");
      throw err;
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchAnalyticsOverview(),
      fetchServiceTrends(),
      fetchPeakHours(),
      fetchWaitTimeAnalytics(),
      fetchDivisionQueueStats(),
    ]);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    analyticsData,
    serviceTrends,
    userStats,
    userPerformance,
    peakHours,
    waitTimeStats,
    divisionStats,
    loading,
    error,
    fetchUserAverageTime,
    fetchUserPerformance,
    fetchPeakHours,
    fetchWaitTimeAnalytics,
    fetchDivisionQueueStats,
    refreshData,
    fetchAnalyticsOverview,
    fetchServiceTrends,
  };
};
