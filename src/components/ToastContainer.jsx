import { motion, AnimatePresence } from "motion/react";
import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

const TYPE_CONFIG = {
  error: {
    color:      "var(--neon-gold)" ,
    border:     "rgba(255,107,107,0.5)",
    background: "rgba(255,107,107,0.12)",
    glow:       "0 0 24px rgba(255,107,107,0.3)",
    icon:       "✕",
  },
  success: {
    color:      "var(--neon-cyan)",
    border:     "rgba(0,245,255,0.4)",
    background: "rgba(0,245,255,0.08)",
    glow:       "0 0 24px rgba(0,245,255,0.2)",
    icon:       "✓",
  },
  info: {
    color:      "var(--neon-violet)",
    border:     "rgba(157,78,221,0.4)",
    background: "rgba(157,78,221,0.1)",
    glow:       "0 0 24px rgba(157,78,221,0.2)",
    icon:       "ℹ",
  },
};

export default function ToastContainer() {
  const { toasts, dismiss } = useContext(ToastContext);

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[200] flex flex-col gap-2 items-center"
      style={{ transform: "translateX(-50%)", pointerEvents: "none" }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => {
          const cfg = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG.info;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold"
              style={{
                pointerEvents:   "all",
                background:      cfg.background,
                border:          `1px solid ${cfg.border}`,
                boxShadow:       `${cfg.glow}, 0 8px 32px rgba(0,0,0,0.5)`,
                backdropFilter:  "blur(16px)",
                color:           "var(--text-primary)",
                minWidth:        "260px",
                maxWidth:        "420px",
              }}
            >
              {/* Icon */}
              <span
                className="text-base font-bold shrink-0 w-5 h-5 flex items-center justify-center rounded-full"
                style={{
                  color:      cfg.color,
                  background: `${cfg.border}`,
                }}
              >
                {cfg.icon}
              </span>

              {/* Message */}
              <span className="flex-1">{toast.message}</span>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}