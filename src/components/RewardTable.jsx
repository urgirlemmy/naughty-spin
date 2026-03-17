import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { staggerContainer, staggerItem, scaleUp } from "../utils/animations";
import { prizesApi } from "../utils/api";
import { useToast } from "../context/ToastContext";

const RARITY_OPTIONS = ["common", "uncommon", "legendary"];

const rarityConfig = {
  legendary: { color: "var(--neon-gold)",  border: "rgba(255,215,0,0.3)",   bg: "rgba(255,215,0,0.07)"  },
  uncommon:  { color: "var(--neon-cyan)",  border: "rgba(0,245,255,0.25)",  bg: "rgba(0,245,255,0.06)"  },
  common:    { color: "var(--text-muted)", border: "rgba(157,78,221,0.15)", bg: "rgba(157,78,221,0.04)" },
};

export default function RewardTable({ prizes, onPrizesChange }) {
  const [loading, setLoading]         = useState(false);
  const [deletingId, setDeletingId]   = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { addToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleAdd = async (data) => {
    setLoading(true);
    const res = await prizesApi.create({
      code:      data.code.toUpperCase().replace(/\s+/g, ''),
      full_name: data.full_name,
      emoji:     data.emoji || '🎁',
      rarity:    data.rarity,
      weight:    parseInt(data.weight) || 10,
    });
    if (res.ok) {
      reset();
      setShowAddForm(false);
      addToast('Prize added successfully.', 'success');
      onPrizesChange();
    } else {
      addToast(res.error, 'error');
    }
    setLoading(false);
  };

  const handleRemove = async (id) => {
    setDeletingId(id);
    const res = await prizesApi.remove(id);
    if (res.ok) {
      addToast('Prize removed.', 'success');
      onPrizesChange();
    } else {
      addToast(res.error, 'error');
    }
    setDeletingId(null);
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(13,13,26,0.96)",
        border: "1px solid rgba(255,215,0,0.2)",
        boxShadow: "0 0 40px rgba(255,215,0,0.05)",
      }}
    >
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,215,0,0.15)" }}
      >
        <h2 className="font-display tracking-widest text-xl" style={{ color: "var(--neon-gold)" }}>
          PRIZE MANAGER
        </h2>
        <motion.button
          onClick={() => setShowAddForm(s => !s)}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="text-xs px-3 py-2 rounded-xl font-semibold"
          style={{
            background: showAddForm ? "rgba(255,215,0,0.15)" : "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.3)",
            color: "var(--neon-gold)",
          }}
        >
          {showAddForm ? "✕ Cancel" : "+ Add Prize"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            variants={scaleUp} initial="hidden" animate="visible" exit="exit"
            className="px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,215,0,0.1)" }}
          >
            <form onSubmit={handleSubmit(handleAdd)} className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Prize Code
                </label>
                <input
                  type="text" placeholder="e.g. PRZ200"
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: errors.code ? "1px solid #ff6b6b" : "1px solid rgba(255,215,0,0.2)",
                    color: "var(--text-primary)",
                  }}
                  {...register("code", { required: "Required" })}
                />
                {errors.code && <p className="text-xs" style={{ color: "#ff6b6b" }}>{errors.code.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Full Name
                </label>
                <input
                  type="text" placeholder="e.g. ₹200 Cash"
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: errors.full_name ? "1px solid #ff6b6b" : "1px solid rgba(255,215,0,0.2)",
                    color: "var(--text-primary)",
                  }}
                  {...register("full_name", { required: "Required" })}
                />
                {errors.full_name && <p className="text-xs" style={{ color: "#ff6b6b" }}>{errors.full_name.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Emoji
                </label>
                <input
                  type="text" placeholder="🎁"
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    color: "var(--text-primary)",
                  }}
                  {...register("emoji")}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Rarity
                </label>
                <select
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    color: "var(--text-primary)",
                  }}
                  {...register("rarity")}
                >
                  {RARITY_OPTIONS.map(r => (
                    <option key={r} value={r} style={{ background: "#0f0f1f" }}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Weight
                </label>
                <input
                  type="number" placeholder="10" min="1" max="1000"
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    color: "var(--text-primary)",
                  }}
                  {...register("weight")}
                />
              </div>

              <div className="flex items-end">
                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-2 rounded-lg font-display tracking-widest text-sm disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.1))",
                    border: "1px solid rgba(255,215,0,0.4)",
                    color: "var(--neon-gold)",
                  }}
                >
                  {loading ? "ADDING…" : "ADD PRIZE"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-4 px-5 py-2 text-xs font-semibold tracking-widest uppercase"
        style={{ color: "var(--text-muted)", borderBottom: "1px solid rgba(255,215,0,0.08)" }}
      >
        <span>Prize</span>
        <span>Name</span>
        <span className="text-center">Rarity</span>
        <span className="text-center">Action</span>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {prizes.length === 0 ? (
          <p className="text-center py-8 text-sm italic" style={{ color: "var(--text-muted)" }}>
            No prizes. Add one above.
          </p>
        ) : prizes.map((p) => {
          const cfg = rarityConfig[p.rarity] ?? rarityConfig.common;
          return (
            <motion.div
              key={p.id}
              variants={staggerItem}
              className="grid grid-cols-4 px-5 py-3 items-center"
              style={{ borderBottom: "1px solid rgba(255,215,0,0.05)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{p.emoji}</span>
                <span className="text-xs font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {p.code}
                </span>
              </div>
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>{p.full_name}</span>
              <div className="flex justify-center">
                <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-lg uppercase"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                  {p.rarity}
                </span>
              </div>
              <div className="flex justify-center">
                <motion.button
                  onClick={() => handleRemove(p.id)}
                  disabled={deletingId === p.id}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="text-xs px-3 py-1 rounded-lg font-semibold disabled:opacity-40"
                  style={{
                    background: "rgba(255,107,107,0.1)",
                    border: "1px solid rgba(255,107,107,0.3)",
                    color: "#ff6b6b",
                  }}
                >
                  {deletingId === p.id ? "…" : "Remove"}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}