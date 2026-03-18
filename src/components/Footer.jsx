import { motion } from "motion/react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 mt-auto"
      style={{
        borderTop: "1px solid rgba(157,78,221,0.1)",
      }}
    >
      {/* Tagline */}
      <p
        className="font-display text-sm italic"
        style={{
          background: "linear-gradient(90deg, #FF6EB4, #9D4EDD)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: 0.8,
        }}
      >
        Where luck gets a little naughty
      </p>

      {/* Social link */}
      <motion.a
        href="https://beacons.ai/yourusername"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
        style={{
          background:  "rgba(255,110,180,0.08)",
          border:      "1px solid rgba(255,110,180,0.25)",
          color:       "var(--neon-pink)",
          boxShadow:   "0 0 12px rgba(255,110,180,0.1)",
        }}
      >
        <span>✨</span>
        <span>Emmy's World</span>
        <span style={{ opacity: 0.5 }}>↗</span>
      </motion.a>
    </motion.footer>
  );
}