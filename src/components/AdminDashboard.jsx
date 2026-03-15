import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../utils/animations";

function StatCard({ emoji, label, value, color }) {
  return (
    <motion.div
      variants={staggerItem}
      className="flex flex-col gap-2 rounded-2xl px-5 py-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}33`,
        boxShadow: `0 0 24px ${color}11`,
      }}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="font-display tracking-widest text-3xl" style={{ color }}>
        {value}
      </span>
      <span className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
    </motion.div>
  );
}

export default function AdminDashboard({ users, prizes }) {
  const totalUsers   = users.length;
  const totalSpins   = users.reduce((sum, u) => sum + u.spins, 0);
  const totalPrizes  = prizes.length;
  const adminCount   = users.filter(u => u.isAdmin).length;
  const legendary    = prizes.filter(p => p.rarity === "legendary").length;
  const uncommon     = prizes.filter(p => p.rarity === "uncommon").length;

  const stats = [
    { emoji: "👥", label: "Total Users",       value: totalUsers,  color: "var(--neon-violet)" },
    { emoji: "🎰", label: "Spins Remaining",   value: totalSpins,  color: "var(--neon-cyan)"   },
    { emoji: "🎁", label: "Active Prizes",     value: totalPrizes, color: "var(--neon-gold)"   },
    { emoji: "👑", label: "Admins",            value: adminCount,  color: "var(--neon-violet)" },
    { emoji: "🏆", label: "Legendary Prizes",  value: legendary,   color: "var(--neon-gold)"   },
    { emoji: "⚡", label: "Uncommon Prizes",   value: uncommon,    color: "var(--neon-cyan)"   },
  ];

  return (
    <div className="w-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(13,13,26,0.96)",
        border: "1px solid rgba(157,78,221,0.3)",
        boxShadow: "0 0 40px rgba(157,78,221,0.1)",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4"
        style={{ borderBottom: "1px solid rgba(157,78,221,0.2)" }}
      >
        <h2 className="font-display tracking-widest text-xl"
          style={{ color: "var(--neon-violet)" }}>
          OVERVIEW
        </h2>
      </div>

      {/* Stats grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="p-4 grid grid-cols-3 gap-3"
      >
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </motion.div>
    </div>
  );
}