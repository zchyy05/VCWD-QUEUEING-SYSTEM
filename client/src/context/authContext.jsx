import { useContext, createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
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

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  axios.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${url}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      Cookies.remove("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${url}/auth/sign-in`, {
        email,
        password,
      });

      Cookies.set("token", response.data.token, {
        expires: 7,
        secure: true,
        sameSite: "strict",
      });
      setUser(response.data.user);

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    Cookies.remove("token");
    setUser(null);
  };
  const values = {
    signIn,
    signOut,
    user,
    loading,
    error,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
