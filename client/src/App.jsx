import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import SignIn from "./pages/auth/signIn";
import SignUp from "./pages/auth/signUp";
import Landing from "./pages/landing";
import NotFound from "./pages/error/notFound";
import Dashboard from "./pages/secure-pages/dashboard";
import ProtectedRoute from "./components/uiComponents/protectedRoutes";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth">
          <Route path="signup" element={<SignUp />} />
          <Route path="signin" element={<SignIn />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
