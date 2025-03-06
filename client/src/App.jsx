import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import SignIn from "./pages/auth/signIn";
import SignUp from "./pages/auth/signUp";
import Landing from "./pages/landing";
import NotFound from "./pages/error/notFound";
import Dashboard from "./pages/secure-pages/dashboard";
import ProtectedRoute from "./components/uiComponents/protectedRoutes";
import Terminals from "./pages/secure-pages/terminals";
import ViewQueue from "./pages/view_Queue";
import Profile from "./pages/secure-pages/profile";
import ProtectedAdminRoute from "./components/uiComponents/protectedAdminRoute";
import AdminDashboard from "./pages/admin/adminDashboard";
import AdminDepartment from "./pages/admin/adminDepartment";
import AdminDivision from "./pages/admin/adminDivision";
import AdminUsers from "./pages/admin/adminUsers";
import AdminTerminals from "./pages/admin/adminTerminals";
import AdminVideos from "./pages/admin/adminVIdeos";
import AdminCustomers from "./pages/admin/adminCustomers";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/view" element={<ViewQueue />} />
        <Route path="/auth">
          <Route path="signup" element={<SignUp />} />
          <Route path="signin" element={<SignIn />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/terminals" element={<Terminals />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/department" element={<AdminDepartment />} />
          <Route path="/admin/division" element={<AdminDivision />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/terminals" element={<AdminTerminals />} />
          <Route path="/admin/videos" element={<AdminVideos />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
