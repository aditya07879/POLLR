import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * PublicOnlyRoute — wraps routes that should NOT be accessible
 * when the user is already signed in (signin, signup pages).
 * - Waits for auth resolution before deciding.
 * - Redirects authenticated users straight to /dashboard.
 */
export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading…
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
