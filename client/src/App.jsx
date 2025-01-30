import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import SignIn from "./pages/auth/signIn";
import SignUp from "./pages/auth/signUp";
import Landing from "./pages/landing";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth">
          <Route path="signup" element={<SignUp />} />
          <Route path="signin" element={<SignIn />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
