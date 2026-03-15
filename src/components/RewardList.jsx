import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../utils/animations";

export default function RewardList({ prizes }) {
  const rarityConfig = {
    legendary: { color: "var(--neon-gold)",   border: "rgba(255,215,0,0.3)",   bg: "rgba(255,215,0,0.07)",   label: "LEGENDARY" },
    uncommon:  { color: "var(--neon-cyan)",   border: "rgba(0,245,255,0.25)",  bg: "rgba(0,245,255,0.06)",   label: "UNCOMMON"  },
    common:    { color: "var(--text-muted)",  border: "rgba(157,78,221,0.15)", bg: "rgba(157,78,221,0.04)",  label: "COMMON"    },
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(13,13,26,0.96)",
        border: "1px solid rgba(0,245,255,0.2)",
        boxShadow: "0 0 40px rgba(0,245,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(0,245,255,0.15)" }}
      >
        <h2 className="font-display tracking-widest text-xl"
          style={{ color: "var(--neon-cyan)" }}>
          PRIZE POOL
        </h2>
        <span className="text-xs px-2 py-1 rounded-lg"
          style={{ background: "rgba(0,245,255,0.08)", color: "var(--text-muted)" }}>
          {prizes.length} prizes
        </span>
      </div>

      {/* Prize grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="p-4 grid grid-cols-2 gap-3"
      >
        {prizes.length === 0 ? (
          <p className="col-span-2 text-center py-8 text-sm italic"
            style={{ color: "var(--text-muted)" }}>
            No prizes available.
          </p>
        ) : prizes.map(({ id, fullName, emoji, rarity }) => {
          const cfg = rarityConfig[rarity] ?? rarityConfig.common;
          return (
            <motion.div
              key={id}
              variants={staggerItem}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
              }}
            >
              <span className="text-3xl"
                style={{ filter: rarity === "legendary" ? "drop-shadow(0 0 8px rgba(255,215,0,0.6))" : "none" }}>
                {emoji}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate"
                  style={{ color: "var(--text-primary)" }}>
                  {fullName}
                </span>
                <span className="text-[10px] font-bold tracking-widest mt-0.5"
                  style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}