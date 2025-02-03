// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/authContext";
import Loading from "../uiComponents/loading";
const ProtectedRoute = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/auth/signin" />;
};

export default ProtectedRoute;
