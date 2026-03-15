import { Navigate, Route, Routes } from "react-router";
import Game from "./pages/Game";
import ProtectedRoute from "./providers/ProtectedRoute";
import Admin from "./pages/Admin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Game />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;