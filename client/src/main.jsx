import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/authContext.jsx";
import { DivisionsProvider } from "./context/divisionsContext.jsx";
import { AnnouncementProvider } from "./context/announcementContext.jsx";
import { ThemeProvider } from "./context/themeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AnnouncementProvider>
        <ThemeProvider>
          <AuthContextProvider>
            <DivisionsProvider>
              <App />
            </DivisionsProvider>
          </AuthContextProvider>
        </ThemeProvider>
      </AnnouncementProvider>
    </BrowserRouter>
  </StrictMode>
);
