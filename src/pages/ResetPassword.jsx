import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { authApi } from "../utils/api";
import { pageEnter } from "../utils/animations";
import PageLayout from "../components/layout/PageLayout";

export default function ResetPassword() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [tokens, setTokens] = useState(null);
    const [done, setDone] = useState(false);
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const newPassword = watch("newPassword");

    useEffect(() => {
        // Supabase puts tokens in the URL hash after redirect
        // Format: #access_token=xxx&refresh_token=xxx&type=recovery
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const type = params.get('type');

        if (type === 'recovery' && access_token && refresh_token) {
            setTokens({ access_token, refresh_token });
            // Clean the tokens from the URL bar for security
            window.history.replaceState(null, '', '/reset-password');
        } else {
            addToast('Invalid or expired reset link.', 'error');
            navigate('/', { replace: true });
        }
    }, []);

    const onSubmit = async (data) => {
        if (!tokens) return;

        const res = await authApi.resetPassword(
            tokens.access_token,
            tokens.refresh_token,
            data.newPassword,
        );

        if (res.ok) {
            setDone(true);
            addToast('Password updated successfully! 💋', 'success');
            setTimeout(() => navigate('/'), 2000);
        } else {
            addToast(res.error, 'error');
        }
    };

    if (!tokens && !done) return null;

    return (
        <PageLayout>
            <motion.div
                variants={pageEnter} initial="hidden" animate="visible"
                className="w-full max-w-sm flex flex-col gap-6 mt-20 items-center"
            >
                <div className="text-center">
                    <h1 className="font-display text-5xl mb-2"
                        style={{
                            background: "linear-gradient(90deg, #FF6EB4, #9D4EDD)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        New Password
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Choose something deliciously secure 💋
                    </p>
                </div>

                {done ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-3 text-center"
                    >
                        <span className="text-5xl">✨</span>
                        <p style={{ color: "var(--text-primary)" }}>
                            All done! Redirecting you home…
                        </p>
                    </motion.div>
                ) : (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="w-full flex flex-col gap-4 p-6 rounded-2xl"
                        style={{
                            background: "rgba(13,13,26,0.96)",
                            border: "1px solid rgba(157,78,221,0.3)",
                        }}
                    >
                        <div className="flex flex-col gap-1">
                            <label className="text-xs tracking-widest uppercase"
                                style={{ color: "var(--text-muted)" }}>
                                New Password
                            </label>
                            <input
                                type="password"
                                placeholder="Choose a new password"
                                className="px-3 py-2 rounded-lg text-sm outline-none"
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    border: errors.newPassword
                                        ? "1px solid #ff6b6b"
                                        : "1px solid rgba(157,78,221,0.3)",
                                    color: "var(--text-primary)",
                                }}
                                {...register("newPassword", {
                                    required: "Required",
                                    minLength: { value: 6, message: "Min 6 characters" }
                                })}
                            />
                            {errors.newPassword && (
                                <p className="text-xs" style={{ color: "#ff6b6b" }}>
                                    {errors.newPassword.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs tracking-widest uppercase"
                                style={{ color: "var(--text-muted)" }}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                placeholder="Repeat new password"
                                className="px-3 py-2 rounded-lg text-sm outline-none"
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    border: errors.confirmPassword
                                        ? "1px solid #ff6b6b"
                                        : "1px solid rgba(157,78,221,0.3)",
                                    color: "var(--text-primary)",
                                }}
                                {...register("confirmPassword", {
                                    required: "Required",
                                    validate: v => v === newPassword || "Passwords do not match"
                                })}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs" style={{ color: "#ff6b6b" }}>
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="w-full py-3 rounded-xl font-display text-lg disabled:opacity-40"
                            style={{
                                background: "linear-gradient(135deg, #FF6EB4, #9D4EDD)",
                                border: "1px solid rgba(255,110,180,0.6)",
                                color: "#fff",
                                boxShadow: "0 0 24px rgba(255,110,180,0.4)",
                            }}
                        >
                            {isSubmitting ? "Updating…" : "Update Password 💋"}
                        </motion.button>
                    </form>
                )}
            </motion.div>
        </PageLayout>
    );
}