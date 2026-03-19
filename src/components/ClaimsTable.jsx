import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { staggerContainer, staggerItem } from "../utils/animations";
import { adminApi } from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function ClaimsTable({ claims, onClaimsChange }) {
    const { addToast } = useToast();
    const [claimingId, setClaimingId] = useState(null);
    const [filter, setFilter] = useState("unclaimed"); // "unclaimed" | "claimed" | "all"

    const filtered = claims.filter(c => {
        if (filter === "all") return true;
        return c.status === filter;
    });

    const handleMarkClaimed = async (claimId) => {
        setClaimingId(claimId);
        const res = await adminApi.markClaimed(claimId);
        if (res.ok) {
            addToast('Prize marked as claimed! 🎀', 'success');
            onClaimsChange();
        } else {
            addToast(res.error, 'error');
        }
        setClaimingId(null);
    };

    return (
        <div className="w-full rounded-2xl overflow-hidden"
            style={{
                background: "rgba(13,13,26,0.96)",
                border: "1px solid rgba(255,110,180,0.25)",
                boxShadow: "0 0 40px rgba(255,110,180,0.06)",
            }}
        >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(255,110,180,0.15)" }}
            >
                <h2 className="font-display text-xl" style={{ color: "var(--neon-pink)" }}>
                    Prize Claims
                </h2>

                {/* Filter tabs */}
                <div className="flex gap-1 p-1 rounded-xl"
                    style={{ background: "rgba(255,110,180,0.06)", border: "1px solid rgba(255,110,180,0.15)" }}
                >
                    {["unclaimed", "claimed", "all"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                            style={{
                                background: filter === f ? "rgba(255,110,180,0.2)" : "transparent",
                                color: filter === f ? "var(--neon-pink)" : "var(--text-muted)",
                                border: filter === f ? "1px solid rgba(255,110,180,0.4)" : "1px solid transparent",
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table head */}
            <div className="grid grid-cols-4 px-5 py-2 text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--text-muted)", borderBottom: "1px solid rgba(255,110,180,0.08)" }}
            >
                <span>Player</span>
                <span>Prize</span>
                <span className="text-center">Status</span>
                <span className="text-center">Action</span>
            </div>

            {/* Rows */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                {filtered.length === 0 ? (
                    <p className="text-center py-10 text-sm italic" style={{ color: "var(--text-muted)" }}>
                        No {filter === "all" ? "" : filter} claims yet 🎀
                    </p>
                ) : filtered.map((c) => (
                    <motion.div
                        key={c.id}
                        variants={staggerItem}
                        className="grid grid-cols-4 px-5 py-3 items-center"
                        style={{ borderBottom: "1px solid rgba(255,110,180,0.06)" }}
                    >
                        {/* Player */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                {c.profiles?.username ?? '—'}
                            </span>
                        </div>

                        {/* Prize */}
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{c.prizes?.emoji ?? '🎁'}</span>
                            <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                                {c.prizes?.full_name ?? '—'}
                            </span>
                        </div>

                        {/* Status badge */}
                        <div className="flex justify-center">
                            <span
                                className="text-[10px] font-bold px-2 py-1 rounded-full"
                                style={{
                                    background: c.status === 'claimed'
                                        ? "rgba(0,245,255,0.1)"
                                        : "rgba(255,110,180,0.1)",
                                    color: c.status === 'claimed'
                                        ? "var(--neon-cyan)"
                                        : "var(--neon-pink)",
                                    border: `1px solid ${c.status === 'claimed'
                                        ? "rgba(0,245,255,0.3)"
                                        : "rgba(255,110,180,0.3)"}`,
                                }}
                            >
                                {c.status === 'claimed' ? '✓ Claimed' : '🎀 Unclaimed'}
                            </span>
                        </div>

                        {/* Action */}
                        <div className="flex justify-center">
                            {c.status === 'unclaimed' ? (
                                <motion.button
                                    onClick={() => handleMarkClaimed(c.id)}
                                    disabled={claimingId === c.id}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="text-xs px-3 py-1 rounded-lg font-semibold disabled:opacity-40"
                                    style={{
                                        background: "rgba(0,245,255,0.08)",
                                        border: "1px solid rgba(0,245,255,0.3)",
                                        color: "var(--neon-cyan)",
                                    }}
                                >
                                    {claimingId === c.id ? '…' : 'Mark Claimed'}
                                </motion.button>
                            ) : (
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Summary */}
            <div className="px-5 py-3 flex gap-4"
                style={{ borderTop: "1px solid rgba(255,110,180,0.08)" }}
            >
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Total: <span style={{ color: "var(--text-primary)" }}>{claims.length}</span>
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Unclaimed: <span style={{ color: "var(--neon-pink)" }}>
                        {claims.filter(c => c.status === 'unclaimed').length}
                    </span>
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Claimed: <span style={{ color: "var(--neon-cyan)" }}>
                        {claims.filter(c => c.status === 'claimed').length}
                    </span>
                </span>
            </div>
        </div>
    );
}