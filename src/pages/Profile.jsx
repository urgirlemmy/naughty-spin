import { useState } from "react";
import { motion, AnimatePresence, addAttrValue } from "motion/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { pageEnter, scaleUp } from "../utils/animations";
import PageLayout from "../components/layout/PageLayout";
import PasswordConfirmModal from "../components/PasswordConfirmModal";
import { useToast } from "../context/ToastContext";

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle = (hasError) => ({
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${hasError ? "#ff6b6b" : "rgba(157,78,221,0.3)"}`,
    color: "var(--text-primary)",
});

function SectionCard({ title, accent = "var(--neon-violet)", children }) {
    return (
        <motion.div
            variants={scaleUp}
            className="w-full rounded-2xl overflow-hidden"
            style={{
                background: "rgba(13,13,26,0.96)",
                border: `1px solid ${accent}44`,
                boxShadow: "0 0 30px rgba(157,78,221,0.08)",
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
    return (
        <AnimatePresence>
            <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm mt-3"
                style={{ color: status.type === "error" ? "#ff6b6b" : "var(--neon-cyan)" }}
            >
                {status.type === "error" ? "✕ " : "✓ "}{status.message}
            </motion.p>
        </AnimatePresence>
    );
}

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

// ── Update Username ───────────────────────────────────────────────────────────
function UpdateUsername() {
    const { updateUsername, user } = useAuth();
    const [pending, setPending] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { newUsername: user?.username ?? "" }
    });

    const onSubmit = (data) => {
        setPending(data); // hold form data, show password modal
    };

    const onConfirm = async (password) => {
        setLoading(true);
        const res = await updateUsername({ newUsername: pending.newUsername, password });
        setLoading(false);
        setPending(null);
        // reset();
        if (res.ok) 
            addToast("Username updated successfully.", "success");
        else 
            addToast(res.error, "error");
    };

    const onDismiss = () => {
        setPending(null);
    };

    return (
        <>
            <SectionCard title="CHANGE USERNAME" accent="var(--neon-violet)">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                            New Username
                        </label>
                        <input
                            type="text"
                            placeholder="Choose a new username"
                            className="px-3 py-2 rounded-lg text-sm outline-none"
                            style={inputStyle(errors.newUsername)}
                            {...register("newUsername", {
                                required: "Required",
                                minLength: { value: 3, message: "Min 3 characters" }
                            })}
                        />
                        {errors.newUsername && (
                            <p className="text-xs" style={{ color: "#ff6b6b" }}>{errors.newUsername.message}</p>
                        )}
                    </div>
                    <SubmitButton label="UPDATE USERNAME" isSubmitting={false} color="var(--neon-violet)" />
                </form>
            </SectionCard>

            <AnimatePresence>
                {pending && (
                    <PasswordConfirmModal
                        onConfirm={onConfirm}
                        onDismiss={onDismiss}
                        loading={loading}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// ── Update Password ───────────────────────────────────────────────────────────
function UpdatePassword() {
    const { updatePassword } = useAuth();
    const [pending, setPending] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
    const newPassword = watch("newPassword");

    const onSubmit = (data) => {
        setPending(data);
    };

    const onConfirm = async (currentPassword) => {
        setLoading(true);
        const res = await updatePassword({
            currentPassword,
            newPassword: pending.newPassword,
        });
        setLoading(false);
        setPending(null);
        reset();
        if (res.ok) 
            addToast("Password updated successfully.", "success");
        else 
            addToast(res.error, "error");
    };

    const onDismiss = () => {
        setPending(null);
        reset();
    };

    return (
        <>
            <SectionCard title="CHANGE PASSWORD" accent="var(--neon-cyan)">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                            New Password
                        </label>
                        <input
                            type="password"
                            placeholder="Choose a new password"
                            className="px-3 py-2 rounded-lg text-sm outline-none"
                            style={inputStyle(errors.newPassword)}
                            {...register("newPassword", {
                                required: "Required",
                                minLength: { value: 6, message: "Min 6 characters" }
                            })}
                        />
                        {errors.newPassword && (
                            <p className="text-xs" style={{ color: "#ff6b6b" }}>{errors.newPassword.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            placeholder="Repeat new password"
                            className="px-3 py-2 rounded-lg text-sm outline-none"
                            style={inputStyle(errors.confirmPassword)}
                            {...register("confirmPassword", {
                                required: "Required",
                                validate: v => v === newPassword || "Passwords do not match"
                            })}
                        />
                        {errors.confirmPassword && (
                            <p className="text-xs" style={{ color: "#ff6b6b" }}>{errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <SubmitButton label="UPDATE PASSWORD" isSubmitting={false} color="var(--neon-cyan)" />
                </form>
            </SectionCard>

            <AnimatePresence>
                {pending && (
                    <PasswordConfirmModal
                        onConfirm={onConfirm}
                        onDismiss={onDismiss}
                        loading={loading}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// ── Update Email ──────────────────────────────────────────────────────────────
function UpdateEmail() {
    const { user, updateEmail } = useAuth();
    const [pending, setPending] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { email: user?.email ?? "" }
    });

    const onSubmit = (data) => {
        setPending(data);
    };

    const onConfirm = async (password) => {
        setLoading(true);
        const res = await updateEmail({ email: pending.email, password });
        setLoading(false);
        setPending(null);
        // reset({ email: user?.email ?? "" });
        if (res.ok) addToast("Email updated successfully.", "success");
        else addToast(res.error, "error");
    };

    const onDismiss = () => {
        setPending(null);
        // reset({ email: user?.email ?? "" });
    };

    return (
        <>
            <SectionCard title="EMAIL ADDRESS" accent="var(--neon-gold)">
                {user?.email && (
                    <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                        Current: <span style={{ color: "var(--neon-gold)" }}>{user.email}</span>
                    </p>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                            {user?.email ? "New Email" : "Add Email"}
                        </label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="px-3 py-2 rounded-lg text-sm outline-none"
                            style={inputStyle(errors.email)}
                            {...register("email", {
                                required: "Required",
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" }
                            })}
                        />
                        {errors.email && (
                            <p className="text-xs" style={{ color: "#ff6b6b" }}>{errors.email.message}</p>
                        )}
                    </div>
                    <SubmitButton label={user?.email ? "UPDATE EMAIL" : "ADD EMAIL"} isSubmitting={false} color="var(--neon-gold)" />
                </form>
            </SectionCard>

            <AnimatePresence>
                {pending && (
                    <PasswordConfirmModal
                        onConfirm={onConfirm}
                        onDismiss={onDismiss}
                        loading={loading}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// ── Delete Account ────────────────────────────────────────────────────────────
function DeleteAccount() {
    const { deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const {addToast} = useToast();

    const onConfirm = async (password) => {
        setLoading(true);
        const res = await deleteAccount({ password });
        setLoading(false);
        setShowConfirm(false);
        if (res.ok) 
            setDeleted(true);
        else
            addToast(res.error, 'error');
    };

    const onDismiss = () => {
        setShowConfirm(false);
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
        <>
            <SectionCard title="DANGER ZONE" accent="#ff6b6b">
                <div className="flex flex-col gap-3">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Permanently delete your account and all associated data. This cannot be undone.
                    </p>
                    <motion.button
                        onClick={() => setShowConfirm(true)}
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
            </SectionCard>

            <AnimatePresence>
                {showConfirm && (
                    <PasswordConfirmModal
                        onConfirm={onConfirm}
                        onDismiss={onDismiss}
                        loading={loading}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// ── Profile page ──────────────────────────────────────────────────────────────
export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

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
                            {user?.username} · {user?.spins} spins · {user?.email ?? "----"}
                        </p>
                    </div>
                    <motion.button
                        onClick={() => navigate("/")}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{
                            background: "rgba(0,245,255,0.08)",
                            border: "1px solid rgba(0,245,255,0.3)",
                            color: "var(--neon-cyan)",
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
                    <DeleteAccount />
                </motion.div>
            </motion.div>
        </PageLayout>
    );
}