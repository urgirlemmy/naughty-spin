import { Navigate } from "react-router";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }) {
    const { isLoggedIn, loading, user } = useAuth();

    // Still loading auth state — render nothing yet
    if (loading) return null;

    // Not logged in or not admin — redirect to game
    if (!isLoggedIn || !user?.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}