import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/authContext";
import Loading from "../uiComponents/loading";

const ProtectedRoute = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const currentLocation = window.location.pathname;

  if (!user) {
    return (
      <Navigate to="/auth/signin" state={{ from: currentLocation }} replace />
    );
  }

  const hasTerminal = Boolean(user?.terminal_id && user?.terminal_number);
  const isTerminalsPage = window.location.pathname === "/terminals";

  if (!hasTerminal && !isTerminalsPage) {
    return <Navigate to="/terminals" replace />;
  }

  if (hasTerminal && isTerminalsPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
