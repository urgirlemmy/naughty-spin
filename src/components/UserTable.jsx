import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "../utils/animations";
import { mockApi } from "../utils/mockApi";

export default function UserTable({ users, onUsersChange }) {
  const [givingSpins, setGivingSpins] = useState({}); // { userId: amount }
  const [loadingId, setLoadingId]     = useState(null);
  const [error, setError]             = useState(null);
  const [successId, setSuccessId]     = useState(null);

  const handleGiveSpins = async (userId) => {
    const amount = parseInt(givingSpins[userId]);
    if (!amount || amount < 1) return;
    setLoadingId(userId);
    setError(null);
    try {
      await mockApi.giveSpins(userId, amount);
      setSuccessId(userId);
      setGivingSpins(prev => ({ ...prev, [userId]: "" }));
      setTimeout(() => setSuccessId(null), 1500);
      onUsersChange(); // tell parent to refresh
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(13,13,26,0.96)",
        border: "1px solid rgba(157,78,221,0.3)",
        boxShadow: "0 0 40px rgba(157,78,221,0.1)",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(157,78,221,0.2)" }}
      >
        <h2 className="font-display tracking-widest text-xl"
          style={{ color: "var(--neon-violet)" }}>
          USERS
        </h2>
        <span className="text-xs px-2 py-1 rounded-lg"
          style={{ background: "rgba(157,78,221,0.15)", color: "var(--text-muted)" }}>
          {users.length} total
        </span>
      </div>

      {/* Table head */}
      <div className="grid grid-cols-4 px-5 py-2 text-xs font-semibold tracking-widest uppercase"
        style={{ color: "var(--text-muted)", borderBottom: "1px solid rgba(157,78,221,0.1)" }}
      >
        <span>User</span>
        <span className="text-center">Spins</span>
        <span className="text-center">Role</span>
        <span className="text-center">Give Spins</span>
      </div>

      {/* Rows */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {users.length === 0 ? (
          <p className="text-center py-8 text-sm italic"
            style={{ color: "var(--text-muted)" }}>
            No users yet.
          </p>
        ) : users.map((u) => (
          <motion.div
            key={u.id}
            variants={staggerItem}
            className="grid grid-cols-4 px-5 py-3 items-center"
            style={{ borderBottom: "1px solid rgba(157,78,221,0.07)" }}
          >
            {/* Username */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{u.isAdmin ? "👑" : "👤"}</span>
              <span className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}>
                {u.username}
              </span>
            </div>

            {/* Spins */}
            <div className="text-center">
              <span className="text-sm font-bold"
                style={{ color: successId === u.id ? "var(--neon-cyan)" : "var(--neon-gold)" }}>
                {u.spins}
              </span>
            </div>

            {/* Role */}
            <div className="text-center">
              <span className="text-xs px-2 py-1 rounded-lg"
                style={{
                  background: u.isAdmin ? "rgba(157,78,221,0.2)" : "rgba(0,245,255,0.08)",
                  color: u.isAdmin ? "var(--neon-violet)" : "var(--neon-cyan)",
                  border: `1px solid ${u.isAdmin ? "rgba(157,78,221,0.4)" : "rgba(0,245,255,0.2)"}`,
                }}>
                {u.isAdmin ? "Admin" : "User"}
              </span>
            </div>

            {/* Give spins */}
            <div className="flex items-center gap-2 justify-center">
              <input
                type="number"
                min="1"
                placeholder="0"
                value={givingSpins[u.id] ?? ""}
                onChange={e => setGivingSpins(prev => ({ ...prev, [u.id]: e.target.value }))}
                className="w-14 text-center text-sm rounded-lg px-2 py-1 outline-none focus:ring-1"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(157,78,221,0.3)",
                  color: "var(--text-primary)",
                  ringColor: "var(--neon-violet)",
                }}
              />
              <motion.button
                onClick={() => handleGiveSpins(u.id)}
                disabled={loadingId === u.id || !givingSpins[u.id]}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs px-3 py-1 rounded-lg font-semibold disabled:opacity-40 transition-all"
                style={{
                  background: successId === u.id
                    ? "rgba(0,245,255,0.15)"
                    : "rgba(157,78,221,0.2)",
                  border: `1px solid ${successId === u.id ? "rgba(0,245,255,0.4)" : "rgba(157,78,221,0.5)"}`,
                  color: successId === u.id ? "var(--neon-cyan)" : "var(--neon-violet)",
                }}
              >
                {loadingId === u.id ? "…" : successId === u.id ? "✓" : "+"}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-xs text-center py-2"
            style={{ color: "#ff6b6b" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}