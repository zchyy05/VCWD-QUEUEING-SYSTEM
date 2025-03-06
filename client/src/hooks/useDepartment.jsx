import { useState, useEffect } from "react";
import axios from "axios";

export const useDepartment = () => {
  const api_url = import.meta.env.VITE_API_URL;
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departmentStats, setDepartmentStats] = useState({
    totalStaff: 0,
    departmentCount: 0,
  });

  const axiosInstance = axios.create({
    baseURL: api_url,
    withCredentials: true, // Enable sending cookies
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Simplified response interceptor that only handles unauthorized responses
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
    const errorMessage = err.response?.data?.message || defaultMessage;
    setError(errorMessage);
    if (err.response?.status !== 401) {
      console.error(defaultMessage, err);
    }
    throw err;
  };

  const fetchDepartmentStats = async () => {
    try {
      const response = await axiosInstance.get("/department/department-stats");
      setDepartmentStats(response.data);
    } catch (err) {
      handleError(err, "Error fetching department stats");
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/department/departments");
      setDepartments(response.data.departments);
      setError(null);
    } catch (err) {
      handleError(err, "Error fetching departments");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchDepartments(), fetchDepartmentStats()]);
  };

  const createDepartment = async (departmentName) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/department/create-department",
        {
          department_name: departmentName,
        }
      );
      await refreshData();
      return response.data;
    } catch (err) {
      handleError(err, "Error creating department");
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id, departmentName) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/department/update-departments/${id}`,
        {
          department_name: departmentName,
        }
      );
      await refreshData();
      return response.data;
    } catch (err) {
      handleError(err, "Error updating department");
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/department/delete-departments/${id}`);
      await refreshData();
    } catch (err) {
      handleError(err, "Error deleting department");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    departments,
    loading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    departmentStats,
    refreshDepartments: fetchDepartments,
    refreshStats: fetchDepartmentStats,
    refreshData,
  };
};
