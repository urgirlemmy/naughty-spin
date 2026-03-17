import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../providers/AuthProvider";
import { useSpin } from "../context/SpinContext";
import { slideInRight, slideInLeft, paylineSweep, reelEntry } from "../utils/animations";
import RewardList from "./RewardList";

import ResultModal from "./ResultModal";
import LoginModal from "./LoginModal";

const REEL_SYMBOL_HEIGHT = 88;

export default function SlotMachine() {
    const { isLoggedIn, user } = useAuth();
    const {
        prizes, loadingPrizes, loadPrizes,
        strips, stopped, paylineActive,
        spinning, spin,
        prize, showResult, setShowResult,
        previousWins,
    } = useSpin();

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const [showPreviousWins, setShowPreviousWins] = useState(false);

    const legendRef = useRef(null);
    const prevWinsRef = useRef(null);

    // Load prizes on mount
    useEffect(() => { loadPrizes(); }, [loadPrizes]);

    // Click outside to close panels
    useEffect(() => {
        function handleClickOutside(e) {
            if (legendRef.current && !legendRef.current.contains(e.target)) setShowLegend(false);
            if (prevWinsRef.current && !prevWinsRef.current.contains(e.target)) setShowPreviousWins(false);
        }
        if (showLegend || showPreviousWins) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showLegend, showPreviousWins]);

    if (loadingPrizes) {
        return (
            <div className="flex flex-col items-center mt-20 gap-4" style={{ color: "var(--text-muted)" }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="text-5xl"
                    style={{ filter: "drop-shadow(0 0 12px rgba(157,78,221,0.8))" }}
                >🎰</motion.div>
                <p className="font-display tracking-widest text-lg">LOADING PRIZES</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-8 mt-6 w-full max-w-lg">

            {/* Title */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <h1
                    className="font-display tracking-widest text-6xl"
                    style={{
                        background: "linear-gradient(90deg, #9D4EDD, #00F5FF, #FFD700)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        filter: "drop-shadow(0 0 20px rgba(157,78,221,0.4))",
                    }}
                >
                    SLOT MACHINE
                </h1>
                {isLoggedIn && (
                    <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                        <span style={{ color: "var(--neon-gold)" }}>{user.spins}</span> spin{user.spins !== 1 ? "s" : ""} remaining
                    </p>
                )}
            </motion.div>

            {/* Machine body */}
            <motion.div
                className="w-full rounded-3xl p-6 relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                    background: "linear-gradient(160deg, #0f0f1f, #0a0a16)",
                    border: "1px solid rgba(157,78,221,0.3)",
                    boxShadow: "0 0 60px rgba(157,78,221,0.15), 0 0 0 1px rgba(0,245,255,0.05) inset, 0 24px 64px rgba(0,0,0,0.6)",
                }}
            >
                <div className="absolute top-0 left-8 right-8 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, var(--neon-violet), var(--neon-cyan), transparent)" }} />

                {/* Reels */}
                <div className="relative mb-6">
                    <AnimatePresence>
                        {paylineActive && (
                            <motion.div
                                key="payline"
                                variants={paylineSweep} initial="hidden" animate="visible" exit="exit"
                                className="absolute inset-x-0 z-20 pointer-events-none rounded-lg"
                                style={{
                                    top: REEL_SYMBOL_HEIGHT,
                                    height: REEL_SYMBOL_HEIGHT,
                                    border: "1px solid rgba(255,215,0,0.8)",
                                    background: "rgba(255,215,0,0.07)",
                                    boxShadow: "0 0 24px 6px rgba(255,215,0,0.3), inset 0 0 20px rgba(255,215,0,0.05)",
                                }}
                            />
                        )}
                    </AnimatePresence>

                    <div className="flex gap-4 justify-center">
                        {strips.map((strip, reelIdx) => (
                            <Reel
                                key={reelIdx}
                                strip={strip}
                                spinning={!stopped[reelIdx]}
                                symbolHeight={REEL_SYMBOL_HEIGHT}
                                isWinner={paylineActive}
                                reelIndex={reelIdx}
                            />
                        ))}
                    </div>
                </div>

                {/* Spin button */}
                {isLoggedIn ? (
                    <motion.button
                        onClick={spin}
                        disabled={spinning || !user?.spins}
                        whileHover={!spinning && user?.spins ? { scale: 1.03 } : {}}
                        whileTap={!spinning && user?.spins ? { scale: 0.97 } : {}}
                        className="w-full py-4 rounded-xl font-display tracking-widest text-xl transition-all disabled:opacity-40"
                        style={{
                            background: spinning ? "rgba(157,78,221,0.2)" : "linear-gradient(135deg, #9D4EDD, #6B21A8)",
                            border: "1px solid rgba(157,78,221,0.6)",
                            color: "#fff",
                            boxShadow: spinning ? "none" : "0 0 24px rgba(157,78,221,0.5), 0 4px 16px rgba(0,0,0,0.4)",
                        }}
                    >
                        {spinning ? (
                            <span style={{ color: "var(--text-muted)" }}>SPINNING…</span>
                        ) : user?.spins ? (
                            <span style={{ background: "linear-gradient(90deg, #fff, #00F5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                SPIN
                            </span>
                        ) : (
                            <span style={{ color: "var(--text-muted)" }}>NO SPINS LEFT</span>
                        )}
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={() => setShowLoginModal(true)}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="w-full py-4 rounded-xl font-display tracking-widest text-xl"
                        style={{
                            background: "rgba(0,245,255,0.08)",
                            border: "1px solid rgba(0,245,255,0.3)",
                            color: "var(--neon-cyan)",
                            boxShadow: "0 0 18px rgba(0,245,255,0.1)",
                        }}
                    >
                        LOGIN TO PLAY
                    </motion.button>
                )}
            </motion.div>

            {/* Legend button — fixed bottom right */}
            <motion.button
                onClick={() => setShowLegend(!showLegend)}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold"
                style={{
                    background: "rgba(13,13,26,0.95)",
                    border: "1px solid rgba(157,78,221,0.5)",
                    color: "var(--neon-violet)",
                    boxShadow: showLegend
                        ? "0 0 24px rgba(157,78,221,0.6), 0 4px 20px rgba(0,0,0,0.5)"
                        : "0 0 14px rgba(157,78,221,0.3), 0 4px 20px rgba(0,0,0,0.5)",
                    backdropFilter: "blur(12px)",
                }}
            >
                <span>⛳</span>
                <span className="font-display tracking-widest text-xs">LEGEND</span>
            </motion.button>

            {/* Previous Wins button — fixed bottom left, only when logged in */}
            {isLoggedIn && (
                <motion.button
                    onClick={() => setShowPreviousWins(!showPreviousWins)}
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                    className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-3 py-3 rounded-full text-sm font-semibold"
                    style={{
                        background: "rgba(13,13,26,0.95)",
                        border: "1px solid rgba(0,245,255,0.4)",
                        color: "var(--neon-cyan)",
                        boxShadow: showPreviousWins
                            ? "0 0 24px rgba(0,245,255,0.5), 0 4px 20px rgba(0,0,0,0.5)"
                            : "0 0 14px rgba(0,245,255,0.2), 0 4px 20px rgba(0,0,0,0.5)",
                        backdropFilter: "blur(12px)",
                    }}
                >
                    <span>🎖️</span>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="font-display tracking-widest text-xs">WINS</span>
                        {previousWins.length > 0 && (
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                {previousWins.length} total
                            </span>
                        )}
                    </div>
                </motion.button>
            )}

            {/* Login modal */}
            <AnimatePresence>
                {showLoginModal && <LoginModal onFinish={() => setShowLoginModal(false)} />}
            </AnimatePresence>

            {/* Legend panel */}
            <AnimatePresence>
                {showLegend && (
                    <motion.div
                        ref={legendRef}
                        variants={slideInRight} initial="hidden" animate="visible" exit="exit"
                        className="fixed right-4 z-50 w-64 rounded-2xl p-4"
                        style={{
                            top: "76px",
                            background: "rgba(13,13,26,0.96)",
                            border: "1px solid rgba(157,78,221,0.4)",
                            boxShadow: "0 0 40px rgba(157,78,221,0.2), 0 8px 32px rgba(0,0,0,0.6)",
                            backdropFilter: "blur(16px)",
                        }}
                    >
                        <h2 className="font-display tracking-widest text-lg mb-3" style={{ color: "var(--neon-violet)" }}>
                            PRIZE LEGEND
                        </h2>
                        <RewardList prizes={prizes} compact />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Previous Wins panel */}
            <AnimatePresence>
                {showPreviousWins && (
                    <motion.div
                        ref={prevWinsRef}
                        variants={slideInLeft} initial="hidden" animate="visible" exit="exit"
                        className="fixed left-4 z-50 w-64 rounded-2xl p-4 flex flex-col"
                        style={{
                            top: "76px",
                            maxHeight: "calc(100vh - 100px)",
                            background: "rgba(13,13,26,0.96)",
                            border: "1px solid rgba(0,245,255,0.3)",
                            boxShadow: "0 0 40px rgba(0,245,255,0.1), 0 8px 32px rgba(0,0,0,0.6)",
                            backdropFilter: "blur(16px)",
                        }}
                    >
                        <h2 className="font-display tracking-widest text-lg mb-3" style={{ color: "var(--neon-cyan)" }}>
                            YOUR WINS
                        </h2>
                        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                            {previousWins.length === 0 ? (
                                <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>No wins yet… spin king 👑</p>
                            ) : previousWins.map((w, i) => (
                                <div key={i} className="rounded-xl p-2 text-sm"
                                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(157,78,221,0.15)" }}>
                                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{w.emoji} {w.fullName}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{w.time}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ResultModal prize={showResult ? prize : null} onClose={() => setShowResult(false)} />
        </div>
    );
}

// ── Reel ─────────────────────────────────────────────────────────────────────
function Reel({ strip, spinning, symbolHeight, isWinner, reelIndex }) {
    const SYMBOLS_PER_REEL = 24;
    const visibleCount = 3;
    const windowHeight = symbolHeight * visibleCount;
    const stopOffset = -(strip.length - visibleCount) * symbolHeight;

    return (
        <motion.div
            variants={reelEntry(reelIndex)} initial="hidden" animate="visible"
            className="relative overflow-hidden rounded-2xl"
            style={{
                width: symbolHeight,
                height: windowHeight,
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(157,78,221,0.25)",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
            }}
        >
            <div className="absolute inset-x-0 top-0 h-8 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, rgba(8,8,16,0.9), transparent)" }} />
            <div className="absolute inset-x-0 bottom-0 h-8 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(8,8,16,0.9), transparent)" }} />

            <motion.div
                animate={spinning
                    ? { y: [0, -(SYMBOLS_PER_REEL * symbolHeight * 0.6), 0] }
                    : { y: stopOffset }
                }
                transition={spinning
                    ? { duration: 0.45, repeat: Infinity, ease: "linear" }
                    : { duration: 0.4, ease: "easeOut" }
                }
                style={{ position: "absolute", top: 0, left: 0, right: 0 }}
            >
                {strip.map((prize, i) => {
                    const isMiddleRow = !spinning && i === strip.length - 2;
                    return (
                        <div
                            key={i}
                            className="flex flex-col items-center justify-center transition-all duration-300"
                            style={{
                                height: symbolHeight,
                                opacity: (!spinning && !isMiddleRow) ? 0.2 : 1,
                                transform: isMiddleRow && isWinner ? "scale(1.18)" : "scale(1)",
                            }}
                        >
                            <span className="text-4xl" style={{
                                filter: isMiddleRow && isWinner ? "drop-shadow(0 0 12px rgba(255,215,0,0.8))" : "none"
                            }}>
                                {prize.emoji}
                            </span>
                            <span className="text-[9px] font-semibold mt-1 tracking-widest"
                                style={{ color: isMiddleRow && isWinner ? "var(--neon-gold)" : "var(--text-muted)" }}>
                                {prize.code}
                            </span>
                        </div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}