import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { pageEnter, scaleUp } from "../utils/animations";
import PageLayout from "../components/layout/PageLayout";

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(157,78,221,0.3)",
  color: "var(--text-primary)",
};

const cardStyle = {
  background: "rgba(13,13,26,0.96)",
  border: "1px solid rgba(157,78,221,0.25)",
  boxShadow: "0 0 30px rgba(157,78,221,0.08)",
};

function SectionCard({ title, accent = "var(--neon-violet)", children }) {
  return (
    <motion.div
      variants={scaleUp}
      className="w-full rounded-2xl overflow-hidden"
      style={{
        ...cardStyle,
        borderColor: `${accent}44`,
      }}
    >
      <div className="px-6 py-4" style={{ borderBottom: `1px solid ${accent}22` }}>
        <h2 className="font-display tracking-widest text-lg" style={{ color: accent }}>
          {title}
        </h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </motion.div>
  );
}

function StatusMessage({ status }) {
  if (!status) return null;
  const isError = status.type === "error";
  return (
    <AnimatePresence>
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-sm mt-3"
        style={{ color: isError ? "#ff6b6b" : "var(--neon-cyan)" }}
      >
        {isError ? "✕ " : "✓ "}{status.message}
      </motion.p>
    </AnimatePresence>
  );
}

function FieldInput({ label, type = "text", placeholder, registration, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
        style={{
          ...inputStyle,
          borderColor: error ? "#ff6b6b" : "rgba(157,78,221,0.3)",
        }}
        {...registration}
      />
      {error && <p className="text-xs" style={{ color: "#ff6b6b" }}>{error.message}</p>}
    </div>
  );
}

// ── Username section ──────────────────────────────────────────────────────────
function UpdateUsername() {
  const { updateUsername } = useAuth();
  const [status, setStatus] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setStatus(null);
    const res = await updateUsername({ newUsername: data.newUsername, password: data.password });
    if (res.ok) {
      setStatus({ type: "success", message: "Username updated successfully." });
      reset();
    } else {
      setStatus({ type: "error", message: res.error });
    }
  };

  return (
    <SectionCard title="CHANGE USERNAME" accent="var(--neon-violet)">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <FieldInput
          label="New Username"
          placeholder="Choose a new username"
          registration={register("newUsername", {
            required: "Required",
            minLength: { value: 3, message: "Min 3 characters" }
          })}
          error={errors.newUsername}
        />
        <FieldInput
          label="Confirm with Password"
          type="password"
          placeholder="Enter current password"
          registration={register("password", { required: "Required" })}
          error={errors.password}
        />
        <SubmitButton label="UPDATE USERNAME" isSubmitting={isSubmitting} color="var(--neon-violet)" />
        <StatusMessage status={status} />
      </form>
    </SectionCard>
  );
}

// ── Password section ──────────────────────────────────────────────────────────
function UpdatePassword() {
  const { updatePassword } = useAuth();
  const [status, setStatus] = useState(null);
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm();
  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    setStatus(null);
    const res = await updatePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    if (res.ok) {
      setStatus({ type: "success", message: "Password updated successfully." });
      reset();
    } else {
      setStatus({ type: "error", message: res.error });
    }
  };

  return (
    <SectionCard title="CHANGE PASSWORD" accent="var(--neon-cyan)">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <FieldInput
          label="Current Password"
          type="password"
          placeholder="Enter current password"
          registration={register("currentPassword", { required: "Required" })}
          error={errors.currentPassword}
        />
        <FieldInput
          label="New Password"
          type="password"
          placeholder="Choose a new password"
          registration={register("newPassword", {
            required: "Required",
            minLength: { value: 6, message: "Min 6 characters" }
          })}
          error={errors.newPassword}
        />
        <FieldInput
          label="Confirm New Password"
          type="password"
          placeholder="Repeat new password"
          registration={register("confirmPassword", {
            required: "Required",
            validate: v => v === newPassword || "Passwords do not match"
          })}
          error={errors.confirmPassword}
        />
        <SubmitButton label="UPDATE PASSWORD" isSubmitting={isSubmitting} color="var(--neon-cyan)" />
        <StatusMessage status={status} />
      </form>
    </SectionCard>
  );
}

// ── Email section ─────────────────────────────────────────────────────────────
function UpdateEmail() {
  const { user, updateEmail } = useAuth();
  const [status, setStatus] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setStatus(null);
    const res = await updateEmail({ email: data.email, password: data.password });
    if (res.ok) {
      setStatus({ type: "success", message: "Email updated successfully." });
      reset();
    } else {
      setStatus({ type: "error", message: res.error });
    }
  };

  return (
    <SectionCard title="EMAIL ADDRESS" accent="var(--neon-gold)">
      {user?.email && (
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Current: <span style={{ color: "var(--neon-gold)" }}>{user.email}</span>
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <FieldInput
          label={user?.email ? "New Email" : "Add Email"}
          type="email"
          placeholder="your@email.com"
          registration={register("email", {
            required: "Required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" }
          })}
          error={errors.email}
        />
        <FieldInput
          label="Confirm with Password"
          type="password"
          placeholder="Enter current password"
          registration={register("password", { required: "Required" })}
          error={errors.password}
        />
        <SubmitButton label={user?.email ? "UPDATE EMAIL" : "ADD EMAIL"} isSubmitting={isSubmitting} color="var(--neon-gold)" />
        <StatusMessage status={status} />
      </form>
    </SectionCard>
  );
}

// ── Delete account section ────────────────────────────────────────────────────
function DeleteAccount() {
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [deleted, setDeleted]     = useState(false);
  const [status, setStatus]       = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setStatus(null);
    const res = await deleteAccount({ password: data.password });
    if (res.ok) {
      setDeleted(true);
      setConfirmed(false);
      reset();
    } else {
      setStatus({ type: "error", message: res.error });
    }
  };

  if (deleted) {
    return (
      <SectionCard title="ACCOUNT DELETED" accent="#ff6b6b">
        <motion.div
          variants={scaleUp} initial="hidden" animate="visible"
          className="flex flex-col items-center gap-4 py-4 text-center"
        >
          <span className="text-5xl">👋</span>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Your account has been deleted.
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            All your data has been removed. Thanks for playing!
          </p>
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="px-5 py-2 rounded-xl text-sm font-semibold mt-2"
            style={{
              background: "rgba(255,107,107,0.1)",
              border: "1px solid rgba(255,107,107,0.3)",
              color: "#ff6b6b",
            }}
          >
            Back to Home
          </motion.button>
        </motion.div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="DANGER ZONE" accent="#ff6b6b">
      {!confirmed ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <motion.button
            onClick={() => setConfirmed(true)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-fit px-5 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: "rgba(255,107,107,0.08)",
              border: "1px solid rgba(255,107,107,0.3)",
              color: "#ff6b6b",
            }}
          >
            Delete My Account
          </motion.button>
        </div>
      ) : (
        <motion.form
          variants={scaleUp} initial="hidden" animate="visible"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <p className="text-sm font-semibold" style={{ color: "#ff6b6b" }}>
            ⚠ This is irreversible. Enter your password to confirm.
          </p>
          <FieldInput
            label="Confirm with Password"
            type="password"
            placeholder="Enter current password"
            registration={register("password", { required: "Required" })}
            error={errors.password}
          />
          <div className="flex gap-2">
            <motion.button
              type="button"
              onClick={() => { setConfirmed(false); setStatus(null); reset(); }}
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
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{
                background: "rgba(255,107,107,0.15)",
                border: "1px solid rgba(255,107,107,0.4)",
                color: "#ff6b6b",
              }}
            >
              {isSubmitting ? "Deleting…" : "Confirm Delete"}
            </motion.button>
          </div>
          <StatusMessage status={status} />
        </motion.form>
      )}
    </SectionCard>
  );
}

// ── Shared submit button ──────────────────────────────────────────────────────
function SubmitButton({ label, isSubmitting, color }) {
  return (
    <motion.button
      type="submit"
      disabled={isSubmitting}
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      className="w-fit px-5 py-2 rounded-xl font-display tracking-widest text-sm disabled:opacity-40 mt-1"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}55`,
        color,
        boxShadow: `0 0 14px ${color}22`,
      }}
    >
      {isSubmitting ? "SAVING…" : label}
    </motion.button>
  );
}

// ── Profile page ──────────────────────────────────────────────────────────────
export default function Profile() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  return (
    <PageLayout>
      <motion.div
        variants={pageEnter}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg flex flex-col gap-6 mt-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-display tracking-widest text-5xl"
              style={{
                background: "linear-gradient(90deg, #9D4EDD, #00F5FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PROFILE
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {user?.username} · {user?.spins} spins · {user?.email ?? "No email set"}
            </p>
          </div>
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: "rgba(157,78,221,0.08)",
              border: "1px solid rgba(157,78,221,0.3)",
              color: "var(--neon-violet)",
            }}
          >
            ← Back
          </motion.button>
        </div>

        {/* Sections */}
        <motion.div
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4"
        >
          <UpdateUsername />
          <UpdatePassword />
          <UpdateEmail />
          <DeleteAccount />
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}