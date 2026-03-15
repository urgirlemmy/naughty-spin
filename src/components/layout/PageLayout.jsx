import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { fadeIn, slideDown } from "../../utils/animations";
import LoginModal from "../LoginModal";
import { useNavigate } from "react-router";

export default function PageLayout({ children }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>

      {/* NAVBAR — fixed */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(8,8,16,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-dim)",
          boxShadow: "0 1px 0 rgba(157,78,221,0.15), 0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="text-3xl" style={{ filter: "drop-shadow(0 0 8px rgba(157,78,221,0.8))" }}>🎡</span>
          <span
            className="font-display tracking-widest text-3xl"
            style={{
              background: "linear-gradient(90deg, #9D4EDD, #00F5FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NAUGHTY SPIN
          </span>
        </div>

        {/* Auth */}
        <div className="relative" ref={menuRef}>
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(s => !s)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: "rgba(157,78,221,0.15)",
                  border: "1px solid var(--border-neon)",
                  color: "var(--text-primary)",
                  boxShadow: menuOpen ? "0 0 14px rgba(157,78,221,0.4)" : "none",
                }}
              >
                <span style={{ color: "var(--neon-cyan)" }}>●</span>
                {user.username}
                <span style={{ color: "var(--neon-gold)", fontSize: "0.75rem" }}>
                  {user.spins} spins
                </span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    variants={slideDown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-neon)",
                      boxShadow: "0 0 24px rgba(157,78,221,0.25), 0 8px 32px rgba(0,0,0,0.5)",
                    }}
                  >
                    {/* Admin link — only visible to admins */}
                    {user?.isAdmin && (
                      <button
                        onClick={() => { navigate("/admin"); setMenuOpen(false); }}
                        className="w-full px-4 py-3 text-left text-sm flex justify-between items-center transition-all hover:bg-white/5"
                        style={{ color: "var(--neon-cyan)", borderBottom: "1px solid rgba(157,78,221,0.15)" }}
                      >
                        <span>Admin Panel</span>
                        <span>⚙️</span>
                      </button>
                    )}

                    <button
                      onClick={logout}
                      className="w-full px-4 py-3 text-left text-sm flex justify-between items-center transition-all hover:bg-white/5"
                      style={{ color: "#ff6b6b" }}
                    >
                      <span>Logout</span>
                      <span>🚪</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-5 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #9D4EDD, #00F5FF22)",
                border: "1px solid var(--border-neon)",
                color: "var(--text-primary)",
                boxShadow: "0 0 14px rgba(157,78,221,0.3)",
              }}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* CONTENT — padded below fixed navbar */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 pb-10" style={{ paddingTop: "88px" }}>
        {children}
      </div>

      <AnimatePresence>
        {showLoginModal && <LoginModal onFinish={() => setShowLoginModal(false)} />}
      </AnimatePresence>
    </div>
  );
}