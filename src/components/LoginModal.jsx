import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { useAuth } from "../providers/AuthProvider";
import { useToast } from "../context/ToastContext";
import { authApi } from "../utils/api";
import { fadeIn, scaleUp } from "../utils/animations";

export default function LoginModal({ onFinish }) {
  const [view, setView] = useState("login"); // "login" | "register" | "forgot"

  return (
    <motion.div
      variants={fadeIn} initial="hidden" animate="visible" exit="exit"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        variants={scaleUp} initial="hidden" animate="visible" exit="exit"
        className="w-[90%] max-w-sm p-6 rounded-2xl shadow-xl relative"
        style={{
          background: "linear-gradient(160deg, #0f0f1f, #0a0a16)",
          border:     "1px solid rgba(157,78,221,0.4)",
          boxShadow:  "0 0 60px rgba(157,78,221,0.15), 0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        <div className="absolute top-0 left-8 right-8 h-px"
          style={{ background: "linear-gradient(90deg, transparent, var(--neon-violet), transparent)" }} />

        <h2 className="font-display text-2xl mb-4" style={{ color: "var(--text-primary)" }}>
          {view === "login"    ? "Welcome Back, Darling 💋"
          : view === "register" ? "Join the Fun 🌸"
          :                       "Reset Password 🔐"}
        </h2>

        {/* Tabs — only show for login/register */}
        {view !== "forgot" && (
          <div className="flex rounded-xl overflow-hidden mb-5 text-sm font-semibold"
            style={{ border: "1px solid rgba(157,78,221,0.3)" }}
          >
            <button
              onClick={() => setView("login")}
              className="flex-1 py-2 transition-all"
              style={{
                background: view === "login" ? "rgba(157,78,221,0.3)" : "transparent",
                color:      view === "login" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              Login
            </button>
            <button
              onClick={() => setView("register")}
              className="flex-1 py-2 transition-all"
              style={{
                background: view === "register" ? "rgba(157,78,221,0.3)" : "transparent",
                color:      view === "register" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              Register
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === "login" && (
            <motion.div key="login"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <LoginForm onFinish={onFinish} onForgot={() => setView("forgot")} />
            </motion.div>
          )}
          {view === "register" && (
            <motion.div key="register"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <RegisterForm onFinish={onFinish} />
            </motion.div>
          )}
          {view === "forgot" && (
            <motion.div key="forgot"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <ForgotPasswordForm onBack={() => setView("login")} onFinish={onFinish} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── Login form ────────────────────────────────────────────────────────────────
function LoginForm({ onFinish, onForgot }) {
  const { login }      = useAuth();
  const { addToast }   = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data);
    if (res.ok) {
      addToast(`Welcome back, darling! 💋`, 'success');
      onFinish();
    } else {
      addToast(res.error, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Username" error={errors.username}>
        <input type="text" placeholder="Enter username"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={fieldStyle(errors.username)}
          {...register("username", { required: "Username is required", minLength: { value: 3, message: "Min 3 characters" } })}
        />
      </Field>
      <Field label="Password" error={errors.password}>
        <input type="password" placeholder="Enter password"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={fieldStyle(errors.password)}
          {...register("password", { required: "Password is required" })}
        />
      </Field>

      {/* Forgot password link */}
      <button
        type="button"
        onClick={onForgot}
        className="text-xs transition-all hover:opacity-100"
        style={{ color: "var(--neon-pink)", opacity: 0.7 }}
      >
        Forgot your password?
      </button>

      <Actions onFinish={onFinish} isSubmitting={isSubmitting} label="Login" />
    </form>
  );
}

// ── Register form ─────────────────────────────────────────────────────────────
function RegisterForm({ onFinish }) {
  const { register: registerUser } = useAuth();
  const { addToast }               = useToast();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    const res = await registerUser({ username: data.username, password: data.password });
    if (res.ok) {
      addToast(`Welcome to Wicked Reels, ${data.username}! 🌸`, 'success');
      onFinish();
    } else {
      addToast(res.error, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Username" error={errors.username}>
        <input type="text" placeholder="Choose a username"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={fieldStyle(errors.username)}
          {...register("username", { required: "Username is required", minLength: { value: 3, message: "Min 3 characters" } })}
        />
      </Field>
      <Field label="Password" error={errors.password}>
        <input type="password" placeholder="Choose a password"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={fieldStyle(errors.password)}
          {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
        />
      </Field>
      <Field label="Confirm Password" error={errors.confirmPassword}>
        <input type="password" placeholder="Repeat password"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={fieldStyle(errors.confirmPassword)}
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

// ── Forgot password form ──────────────────────────────────────────────────────
function ForgotPasswordForm({ onBack, onFinish }) {
  const { addToast }   = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    const res = await authApi.forgotPassword(data.username);
    if (res.ok) {
      setSent(true);
    } else {
      addToast(res.error, 'error');
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-4 text-center"
      >
        <span className="text-4xl">💌</span>
        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
          Check your inbox, darling!
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          If that username has an email attached, a reset link is on its way.
        </p>
        <button
          onClick={onFinish}
          className="px-4 py-2 rounded-xl text-sm font-semibold mt-2"
          style={{
            background: "rgba(255,110,180,0.1)",
            border:     "1px solid rgba(255,110,180,0.3)",
            color:      "var(--neon-pink)",
          }}
        >
          Back to Login
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Enter your username and we'll send a reset link to your registered email.
      </p>
      <Field label="Username" error={errors.username}>
        <input type="text" placeholder="Your username"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={fieldStyle(errors.username)}
          {...register("username", { required: "Username is required" })}
        />
      </Field>
      <div className="flex gap-3 justify-between items-center pt-1">
        <button
          type="button"
          onClick={onBack}
          className="text-xs transition-all hover:opacity-100"
          style={{ color: "var(--text-muted)", opacity: 0.7 }}
        >
          ← Back to login
        </button>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{
            background: "rgba(255,110,180,0.15)",
            border:     "1px solid rgba(255,110,180,0.4)",
            color:      "var(--neon-pink)",
          }}
        >
          {isSubmitting ? "Sending…" : "Send Reset Link 💌"}
        </motion.button>
      </div>
    </form>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────
const fieldStyle = (error) => ({
  background: "rgba(255,255,255,0.05)",
  border:     `1px solid ${error ? "#ff6b6b" : "rgba(157,78,221,0.3)"}`,
  color:      "var(--text-primary)",
});

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
      <button type="button" onClick={onFinish}
        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
        style={{ color: "var(--text-muted)" }}>
        Cancel
      </button>
      <motion.button
        type="submit" disabled={isSubmitting}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
        style={{
          background: "rgba(157,78,221,0.2)",
          border:     "1px solid rgba(157,78,221,0.5)",
          color:      "var(--text-primary)",
          boxShadow:  "0 0 14px rgba(157,78,221,0.2)",
        }}
      >
        {isSubmitting ? "Please wait…" : label}
      </motion.button>
    </div>
  );
}