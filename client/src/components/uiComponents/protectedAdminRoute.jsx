import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/authContext";
import CustomLoading from "./customLoading";
const ProtectedAdminRoute = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/signin" />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/terminals" />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
