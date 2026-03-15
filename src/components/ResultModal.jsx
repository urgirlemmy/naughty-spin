import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, scaleUp } from "../utils/animations";

export default function ResultModal({ prize, onClose }) {
  return (
    <AnimatePresence>
      {prize && (
        <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        variants={fadeIn} initial="hidden" animate="visible" exit="exit"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            variants={scaleUp} initial="hidden" animate="visible" exit="exit"
            className="relative z-10 rounded-2xl p-7 max-w-sm w-full"
            style={{
              background: "linear-gradient(160deg, #0f0f1f, #0a0a16)",
              border: "1px solid rgba(255,215,0,0.4)",
              boxShadow: "0 0 60px rgba(255,215,0,0.15), 0 24px 64px rgba(0,0,0,0.7)",
            }}
          >
            <div
              className="absolute top-0 left-8 right-8 h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--neon-gold), transparent)" }}
            />

            <h2
              className="font-display tracking-widest text-3xl mb-5"
              style={{ color: prize.id === "JACKPOT" ? "var(--neon-gold)" : "var(--text-primary)" }}
            >
              {prize.id === "JACKPOT" ? "🏆 JACKPOT!!" : "🎁 YOU WON"}
            </h2>

            <div className="flex items-center gap-4">
              <span
                className="text-5xl"
                style={{ filter: "drop-shadow(0 0 12px rgba(255,215,0,0.6))" }}
              >
                {prize.emoji}
              </span>
              <div>
                <p className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                  {prize.fullName}
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  {prize.id === "TRYAGAIN"
                    ? "Tough luck! Try again."
                    : prize.id === "JACKPOT"
                    ? "Legendary pull — admin owes you a trophy."
                    : "Claim via the rewards panel."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 rounded-xl font-semibold text-sm"
                style={{
                  background: "rgba(157,78,221,0.2)",
                  border: "1px solid rgba(157,78,221,0.5)",
                  color: "var(--text-primary)",
                }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}