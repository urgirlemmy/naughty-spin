import { motion } from "motion/react";

export default function Loader({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      {/* Blooming flower */}
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Petals — 6 circles blooming outward */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full"
            style={{
              background: i % 2 === 0
                ? "rgba(255,110,180,0.8)"
                : "rgba(157,78,221,0.8)",
              transformOrigin: "center center",
              rotate: `${i * 60}deg`,
              translateY: -22,
            }}
            animate={{
              scale: [0.6, 1.1, 0.6],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
        {/* Center */}
        <motion.div
          className="w-6 h-6 rounded-full z-10 flex items-center justify-center text-sm"
          style={{ background: "linear-gradient(135deg, #FF6EB4, #9D4EDD)" }}
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          🌸
        </motion.div>
      </div>

      {/* Message */}
      <motion.p
        className="font-display text-lg"
        style={{ color: "var(--text-muted)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {message}
      </motion.p>
    </div>
  );
}