import { Navigate, Route, Routes } from "react-router";
import Game from "./pages/Game";
import ProtectedRoute from "./providers/ProtectedRoute";
import AdminView from "./pages/AdminView";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Game />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminView />
          </ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;