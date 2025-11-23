import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";
import LoginModal from "../LoginModal";

export default function PageLayout({ children }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 flex flex-col text-white">

      {/* NAVBAR */}
      <nav className="w-full backdrop-blur-sm bg-white/10 border-b border-white/20 flex items-center justify-between px-6 py-4">

        {/* LEFT — App brand */}
        <div className="flex items-center gap-3 font-extrabold text-2xl">
          <span className="text-3xl">🎡</span>
          <span className="tracking-wide">Naughty Spin</span>
        </div>

        {/* RIGHT — Login Section */}
        <div className="relative" ref={menuRef}>
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 text-indigo-700 font-semibold rounded-xl hover:bg-pink-100 transition"
              >
                👋 Hi, {user.username} ({user.spins})
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="absolute right-0 mt-2 w-40 bg-white text-gray-700 rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => logout()}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex justify-between"
                    >
                      <div className="text-red-500">Logout</div>
                      <div>🚪</div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-white text-indigo-700 font-semibold px-4 py-2 rounded-xl hover:bg-pink-100 transition"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col items-center p-6">
        {children}
      </div>

      {/* MOTION MODAL */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal onFinish={() => setShowLoginModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
