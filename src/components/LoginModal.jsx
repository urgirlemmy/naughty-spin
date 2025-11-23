import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useAuth } from "../providers/AuthProvider";

export default function LoginModal({ onFinish }) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm();
    const { login } = useAuth();

    console.log(watch("username"))
    console.log(watch("code"))

    const onSubmit = async (data) => {
        try {
            const res = await login(data);
            if (res.ok) {
                onFinish();
            }
        } catch (error) {
            // Show an error possibly
            console.error(error);
            onFinish();
        }
    }

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white text-gray-800 w-[90%] max-w-sm p-6 rounded-2xl shadow-xl"
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
                <h2 className="text-xl font-bold mb-4">Welcome Back 👋</h2>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <div>
                        <label className="text-sm font-medium">Username</label>
                        <input
                            type="text"
                            className="w-full bg-gray-100 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Enter username"
                            {...register("username", {required: true, minLength: 3})}
                        />
                        
                        {errors.username && (
                            <div>
                                {errors.username.message}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Login Code</label>
                        <input
                            type="text"
                            className="w-full bg-gray-100 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Game Code"
                            {...register("code", { required: true })}
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onFinish}
                            className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}