import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children, adminOnly = false, userOnly = false }) {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (adminOnly && !user?.is_admin) return <Navigate to="/" replace />;
  if (userOnly && user?.is_admin) return <Navigate to="/admin" replace />;

  return children;
}
