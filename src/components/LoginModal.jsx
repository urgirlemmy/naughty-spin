import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useAuth } from "../providers/AuthProvider";
import { fadeIn, scaleUp } from "../utils/animations";

export default function LoginModal({ onFinish }) {
    const [tab, setTab] = useState("login"); // "login" | "register"

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            variants={fadeIn} initial="hidden" animate="visible" exit="exit"
        >
            <motion.div
                className="bg-white text-gray-800 w-[90%] max-w-sm p-6 rounded-2xl shadow-xl"
                variants={scaleUp} initial="hidden" animate="visible" exit="exit"
            >
                <h2 className="text-xl font-bold mb-4">
                    {tab === "login" ? "Welcome Back 👋" : "Create Account 🎉"}
                </h2>

                {/* Tabs */}
                <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-5 text-sm font-semibold">
                    <button
                        onClick={() => setTab("login")}
                        className={`flex-1 py-2 transition ${tab === "login" ? "bg-indigo-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setTab("register")}
                        className={`flex-1 py-2 transition ${tab === "register" ? "bg-indigo-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
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
    const [serverError, setServerError] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        setServerError(null);
        const res = await login(data);
        if (res.ok) {
            onFinish();
        } else {
            setServerError(res.error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Username" error={errors.username}>
                <input
                    type="text"
                    placeholder="Enter username"
                    className="w-full bg-gray-100 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                    {...register("username", { required: "Username is required", minLength: { value: 3, message: "Min 3 characters" } })}
                />
            </Field>

            <Field label="Password" error={errors.password}>
                <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full bg-gray-100 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                />
            </Field>

            {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

            <Actions onFinish={onFinish} isSubmitting={isSubmitting} label="Login" />
        </form>
    );
}

function RegisterForm({ onFinish }) {
    const { register: registerUser } = useAuth();
    const [serverError, setServerError] = useState(null);
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const password = watch("password");

    const onSubmit = async (data) => {
        setServerError(null);
        const res = await registerUser({ username: data.username, password: data.password });
        if (res.ok) {
            onFinish();
        } else {
            setServerError(res.error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Username" error={errors.username}>
                <input
                    type="text"
                    placeholder="Choose a username"
                    className="w-full bg-gray-100 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                    {...register("username", { required: "Username is required", minLength: { value: 3, message: "Min 3 characters" } })}
                />
            </Field>

            <Field label="Password" error={errors.password}>
                <input
                    type="password"
                    placeholder="Choose a password"
                    className="w-full bg-gray-100 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                />
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword}>
                <input
                    type="password"
                    placeholder="Repeat password"
                    className="w-full bg-gray-100 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                    {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: v => v === password || "Passwords do not match"
                    })}
                />
            </Field>

            {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

            <Actions onFinish={onFinish} isSubmitting={isSubmitting} label="Register" />
        </form>
    );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function Field({ label, error, children }) {
    return (
        <div>
            <label className="text-sm font-medium">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
        </div>
    );
}

function Actions({ onFinish, isSubmitting, label }) {
    return (
        <div className="flex gap-3 justify-end pt-1">
            <button
                type="button"
                onClick={onFinish}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
            >
                {isSubmitting ? "Please wait…" : label}
            </button>
        </div>
    );
}