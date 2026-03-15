import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children, adminOnly = false }) {
    // update to support a requireAuth only mode (profile route needs login 
    // but not admin)
    const { isLoggedIn, user, loading } = useAuth();

    if (loading) return null;
    if (!isLoggedIn) return <Navigate to="/" replace />;
    if (adminOnly && !user?.isAdmin) return <Navigate to="/" replace />;

    return children;
}