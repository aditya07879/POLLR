import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ThemeToggle      from "./components/ThemeToggle.jsx";
import ProtectedRoute   from "./components/ProtectedRoute.jsx";
import PublicOnlyRoute  from "./components/PublicOnlyRoute.jsx";
import Navbar           from "./components/Navbar.jsx";
import Home             from "./pages/Home.jsx";
import SignIn           from "./pages/SignIn.jsx";
import SignUp           from "./pages/SignUp.jsx";
import Dashboard        from "./pages/Dashboard.jsx";
import CreatePoll       from "./pages/CreatePoll.jsx";
import PollPage         from "./pages/PollPage.jsx";
import "./styles.css";
import "./styles/theme.css";

/* Shared layout: sticky nav + scrollable main area */
function WithNav({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-container">{children}</main>
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>

      {/* ── Public ─────────────────────────────────────────── */}

      {/* Root → Home (always, no redirect) */}
      <Route path="/" element={<Home />} />

      {/* Auth pages: redirect to /dashboard if already signed in */}
      <Route
        path="/signin"
        element={
          <PublicOnlyRoute>
            <WithNav><SignIn /></WithNav>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <WithNav><SignUp /></WithNav>
          </PublicOnlyRoute>
        }
      />

      {/* Legacy /login and /signup aliases → redirect cleanly */}
      <Route path="/login"  element={<Navigate to="/signin" replace />} />

      {/* Public poll view (no auth required to vote) */}
      <Route path="/poll/:slug" element={<WithNav><PollPage /></WithNav>} />

      {/* ── Protected ──────────────────────────────────────── */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <WithNav><CreatePoll /></WithNav>
          </ProtectedRoute>
        }
      />

      {/* ── Catch-all → Home ───────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

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
