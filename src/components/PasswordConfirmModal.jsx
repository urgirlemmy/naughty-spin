import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { fadeIn, scaleUp } from "../utils/animations";

export default function PasswordConfirmModal({ onConfirm, onDismiss, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async ({ password }) => {
    await onConfirm(password);
    reset();
  };

  const handleDismiss = () => {
    reset();
    onDismiss();
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleDismiss}
      />
      <motion.div
        variants={scaleUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative z-10 w-full max-w-sm rounded-2xl p-6"
        style={{
          background: "linear-gradient(160deg, #0f0f1f, #0a0a16)",
          border: "1px solid rgba(157,78,221,0.4)",
          boxShadow: "0 0 60px rgba(157,78,221,0.15), 0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-8 right-8 h-px"
          style={{ background: "linear-gradient(90deg, transparent, var(--neon-violet), transparent)" }}
        />

        <h2 className="font-display text-2xl mb-1"
          style={{ color: "var(--text-primary)" }}>
          Confirm Identity
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
          Enter your password to continue.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs tracking-widest uppercase"
              style={{ color: "var(--text-muted)" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              autoFocus
              className="px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: errors.password ? "1px solid #ff6b6b" : "1px solid rgba(157,78,221,0.3)",
                color: "var(--text-primary)",
              }}
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-xs" style={{ color: "#ff6b6b" }}>{errors.password.message}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <motion.button
              type="button"
              onClick={handleDismiss}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-muted)",
              }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{
                background: "rgba(157,78,221,0.2)",
                border: "1px solid rgba(157,78,221,0.5)",
                color: "var(--text-primary)",
                boxShadow: "0 0 14px rgba(157,78,221,0.2)",
              }}
            >
              {loading ? "Confirming…" : "Confirm"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}