import { useState, useEffect } from "react";
import axios from "axios";

export const useDivision = () => {
  const api_url = import.meta.env.VITE_API_URL;
  const [divisions, setDivisions] = useState([]);
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

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/division/get-divisions");
      setDivisions(response.data.divisions);
      setError(null);
    } catch (err) {
      handleError(err, "Error fetching divisions");
    } finally {
      setLoading(false);
    }
  };

  const createDivision = async (divisionData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/division/create-division",
        divisionData
      );
      await fetchDivisions();
      return response.data;
    } catch (err) {
      handleError(err, "Error creating division");
    } finally {
      setLoading(false);
    }
  };

  const updateDivision = async (id, divisionData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/division/update-division/${id}`,
        divisionData
      );
      await fetchDivisions();
      return response.data;
    } catch (err) {
      handleError(err, "Error updating division");
    } finally {
      setLoading(false);
    }
  };

  const deleteDivision = async (id) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/division/delete-division/${id}`);
      await fetchDivisions();
    } catch (err) {
      handleError(err, "Error deleting division");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  return {
    divisions,
    loading,
    error,
    createDivision,
    updateDivision,
    deleteDivision,
    refreshDivisions: fetchDivisions,
  };
};
