import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute.jsx";
import PublicOnlyRoute from "../components/PublicOnlyRoute.jsx";
import Navbar from "../components/Navbar.jsx";

import Home from "../pages/Home.jsx";
import SignIn from "../pages/SignIn.jsx";
import SignUp from "../pages/SignUp.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import CreatePoll from "../pages/CreatePoll.jsx";
import PollPage from "../pages/PollPage.jsx";

function WithNav({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-container">{children}</main>
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/signin"
        element={
          <PublicOnlyRoute>
            <WithNav>
              <SignIn />
            </WithNav>
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <WithNav>
              <SignUp />
            </WithNav>
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/login"
        element={<Navigate to="/signin" replace />}
      />

      <Route
        path="/poll/:slug"
        element={
          <WithNav>
            <PollPage />
          </WithNav>
        }
      />

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
            <WithNav>
              <CreatePoll />
            </WithNav>
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}