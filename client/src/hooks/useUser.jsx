import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const useUser = () => {
  const api_url = import.meta.env.VITE_API_URL;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
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
      if (error.response?.data?.code === "TOKEN_EXPIRED") {
        // Clear cookies and local storage
        Cookies.remove("token");
        localStorage.clear();

        // Redirect to login page
        window.location.href = "/login?expired=true";
        return Promise.reject(error);
      }

      if (error.response?.status === 401) {
        if (error.response.data?.code === "INVALID_TOKEN") {
          Cookies.remove("token");
          localStorage.clear();
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  const formatLastActivity = (lastActivity) => {
    if (!lastActivity) return null;
    return new Date(lastActivity).toISOString();
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/admin/users");
      const formattedUsers = response.data.users.map((user) => ({
        ...user,
        last_activity: formatLastActivity(user.last_activity),
      }));
      setUsers(formattedUsers);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add auto-refresh functionality
  useEffect(() => {
    fetchUsers();
    // Refresh user list every minute to update activity status
    const interval = setInterval(fetchUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  // Rest of your CRUD operations remain the same
  const createUser = async (userData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/admin/create-user", userData);
      await fetchUsers();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Error creating user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, userData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/admin/update-user/${id}`,
        userData
      );
      await fetchUsers();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Error updating user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/admin/delete-user/${id}`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserById = async (id) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/admin/user/${id}`);
      return {
        ...response.data.user,
        last_activity: formatLastActivity(response.data.user.last_activity),
      };
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    refreshUsers: fetchUsers,
  };
};
