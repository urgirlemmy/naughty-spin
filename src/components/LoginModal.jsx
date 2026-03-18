import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useAuth } from "../providers/AuthProvider";
import { useToast } from "../context/ToastContext";
import { fadeIn, scaleUp } from "../utils/animations";
import { AnimatePresence } from "motion/react";

export default function LoginModal({ onFinish }) {
  const [tab, setTab] = useState("login");

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        variants={scaleUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-[90%] max-w-sm p-6 rounded-2xl shadow-xl"
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

        <h2 className="font-display text-2xl mb-4"
          style={{ color: "var(--text-primary)" }}>
          {tab === "login" ? "Welcome Back, Darling 💋" : "Join the Fun 🌸"}
        </h2>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-5 text-sm font-semibold"
          style={{ border: "1px solid rgba(157,78,221,0.3)" }}
        >
          <button
            onClick={() => setTab("login")}
            className="flex-1 py-2 transition-all"
            style={{
              background: tab === "login" ? "rgba(157,78,221,0.3)" : "transparent",
              color: tab === "login" ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            Login
          </button>
          <button
            onClick={() => setTab("register")}
            className="flex-1 py-2 transition-all"
            style={{
              background: tab === "register" ? "rgba(157,78,221,0.3)" : "transparent",
              color: tab === "register" ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            Register
          </button>
        </div>

        {tab === "login"
          ? <LoginForm onFinish={onFinish} />
          : <RegisterForm onFinish={onFinish} />
        }
      </motion.div>
    </motion.div>
  );
}

function LoginForm({ onFinish }) {
  const { login } = useAuth();
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data);
    if (res.ok) {
      addToast(`Welcome back, ${res.data?.user?.username ?? data.username}! 💋`, 'success');
      onFinish();
    } else {
      addToast(res.error, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Username" error={errors.username}>
        <input
          type="text"
          placeholder="Enter username"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: errors.username ? "1px solid #ff6b6b" : "1px solid rgba(157,78,221,0.3)",
            color: "var(--text-primary)",
          }}
          {...register("username", { required: "Username is required", minLength: { value: 3, message: "Min 3 characters" } })}
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <input
          type="password"
          placeholder="Enter password"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: errors.password ? "1px solid #ff6b6b" : "1px solid rgba(157,78,221,0.3)",
            color: "var(--text-primary)",
          }}
          {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
        />
      </Field>

      <Actions onFinish={onFinish} isSubmitting={isSubmitting} label="Login" />
    </form>
  );
}

function RegisterForm({ onFinish }) {
  const { register: registerUser } = useAuth();
  const { addToast } = useToast();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    const res = await registerUser({ username: data.username, password: data.password });
    if (res.ok) {
      addToast(`Welcome to Wicked Reels, ${data.username} 🌸`, 'success');
      onFinish();
    } else {
      addToast(res.error, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Username" error={errors.username}>
        <input
          type="text"
          placeholder="Choose a username"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: errors.username ? "1px solid #ff6b6b" : "1px solid rgba(157,78,221,0.3)",
            color: "var(--text-primary)",
          }}
          {...register("username", { required: "Username is required", minLength: { value: 3, message: "Min 3 characters" } })}
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <input
          type="password"
          placeholder="Choose a password"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: errors.password ? "1px solid #ff6b6b" : "1px solid rgba(157,78,221,0.3)",
            color: "var(--text-primary)",
          }}
          {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
        />
      </Field>

      <Field label="Confirm Password" error={errors.confirmPassword}>
        <input
          type="password"
          placeholder="Repeat password"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: errors.confirmPassword ? "1px solid #ff6b6b" : "1px solid rgba(157,78,221,0.3)",
            color: "var(--text-primary)",
          }}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: v => v === password || "Passwords do not match"
          })}
        />
      </Field>

      <Actions onFinish={onFinish} isSubmitting={isSubmitting} label="Register" />
    </form>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase mb-1 block"
        style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#ff6b6b" }}>{error.message}</p>}
    </div>
  );
}

function Actions({ onFinish, isSubmitting, label }) {
  return (
    <div className="flex gap-3 justify-end pt-1">
      <button
        type="button"
        onClick={onFinish}
        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
        style={{ color: "var(--text-muted)" }}
      >
        Cancel
      </button>
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
        style={{
          background: "rgba(157,78,221,0.2)",
          border: "1px solid rgba(157,78,221,0.5)",
          color: "var(--text-primary)",
          boxShadow: "0 0 14px rgba(157,78,221,0.2)",
        }}
      >
        {isSubmitting ? "Please wait…" : label}
      </motion.button>
    </div>
  );
}