import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import PageLayout from "../components/layout/PageLayout";
import SlotMachine from "../components/SlotMachine";
import { SpinProvider } from "../context/SpinContext";

export default function Game() {
  const { isLoggedIn, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isLoggedIn && user?.is_admin) {
      navigate("/admin", { replace: true });
    }
  }, [loading, isLoggedIn, user, navigate]);

  // Don't render anything while redirecting
  if (!loading && isLoggedIn && user?.is_admin) return null;

  return (
    <SpinProvider>
      <PageLayout>
        <SlotMachine />
      </PageLayout>
    </SpinProvider>
  );
}