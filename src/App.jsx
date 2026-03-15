import { useState } from "react";
import UserView from "./pages/UserView";
import Game from "./pages/Game";

function App() {
  const [page, setPage] = useState("spin");

  return (
    <>
      {/* Dev toggle — remove once you decommission the spin wheel */}
      <div className="fixed bottom-4 right-4 z-[100] flex gap-2">
        <button
          onClick={() => setPage("spin")}
          className={`px-3 py-1 rounded-lg text-sm font-semibold shadow ${page === "spin" ? "bg-yellow-400 text-gray-900" : "bg-gray-700 text-white"}`}
        >
          🎡 Spin
        </button>
        <button
          onClick={() => setPage("slot")}
          className={`px-3 py-1 rounded-lg text-sm font-semibold shadow ${page === "slot" ? "bg-yellow-400 text-gray-900" : "bg-gray-700 text-white"}`}
        >
          🎰 Slots
        </button>
      </div>

      {page === "spin" ? <UserView /> : <Game />}
    </>
  );
}

export default App; 