import { useContext, createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Use auth context must be used within a provider");
  }
  return context;
};

export const AuthContextProvider = ({ children }) => {
  const url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: url,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const publicRoutes = ["/", "/view", "/auth/signin", "/auth/signup"];
    const currentPath = window.location.pathname;
    const isPublicRoute = publicRoutes.includes(currentPath);

    try {
      setLoading(true);
      const response = await api.get("/auth/me");
      const userData = response.data.user;
      setUser(userData);

      // Only handle navigation for authenticated users
      if (userData) {
        if (userData.role === "admin") {
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith("/admin")) {
            navigate("/admin", { replace: true });
          }
        } else {
          const currentPath = window.location.pathname;
          if (!userData.terminal_id && currentPath !== "/terminals") {
            navigate("/terminals", { replace: true });
          }
        }
      }
    } catch (error) {
      setUser(null);
      if (!isPublicRoute) {
        navigate("/auth/signin", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/auth/sign-in", {
        email,
        password,
      });

      const userData = {
        ...response.data.user,
        role: response.data.user.role,
      };
      setUser(userData);

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/auth/sign-up", formData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const response = await api.post("/auth/sign-out");
      console.log(response.data.message);
      setUser(null);
      localStorage.clear();
      navigate("/auth/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const values = {
    signIn,
    signUp,
    signOut,
    updateUser,
    user,
    loading,
    error,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
