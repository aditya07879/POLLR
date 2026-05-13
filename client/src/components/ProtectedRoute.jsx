import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * ProtectedRoute — wraps routes that require authentication.
 * - Shows a full-screen loader while auth state is being resolved.
 * - Redirects unauthenticated users to /signin, preserving the
 *   intended destination so they can be sent back after login.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
