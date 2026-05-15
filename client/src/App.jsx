import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import ThemeToggle from "./components/ThemeToggle.jsx";

import AppRoutes from "./routes/AppRoutes.jsx";

import "./styles.css";
import "./styles/theme.css";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <ThemeToggle />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}