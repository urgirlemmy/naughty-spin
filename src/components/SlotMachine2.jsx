import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "../providers/AuthProvider";
import { mockApi } from "../utils/mockApi";
import LoginModal from "./LoginModal";

const EMOJI_MAP = {
  PRZ100:   "💰",
  COFFEE1:  "☕",
  XPBOOST:  "⚡",
  TRYAGAIN: "🔄",
  PRZ005:   "🪙",
  JACKPOT:  "🎰",
};

const NUM_REELS          = 3;
const REEL_SYMBOL_HEIGHT = 88;
const SYMBOLS_PER_REEL   = 24;
const STOP_DELAYS        = [1400, 2300, 3200];

function buildStrip(prizes, anchorPrize = null) {
  const strip = Array.from({ length: SYMBOLS_PER_REEL }, () =>
    prizes[Math.floor(Math.random() * prizes.length)]
  );
  if (anchorPrize) strip[SYMBOLS_PER_REEL - 2] = anchorPrize;
  return strip;
}

export default function SlotMachine() {
  const { isLoggedIn, user, setUser } = useAuth();

  const [prizes, setPrizes]                     = useState([]);
  const [loadingPrizes, setLoadingPrizes]       = useState(true);
  const [spinning, setSpinning]                 = useState(false);
  const [strips, setStrips]                     = useState([]);
  const [stopped, setStopped]                   = useState(Array(NUM_REELS).fill(true));
  const [paylineActive, setPaylineActive]       = useState(false);
  const [prize, setPrize]                       = useState(null);
  const [showResult, setShowResult]             = useState(false);
  const [showLoginModal, setShowLoginModal]     = useState(false);
  const [showLegend, setShowLegend]             = useState(false);
  const [showPreviousWins, setShowPreviousWins] = useState(false);
  const [previousWins, setPreviousWins]         = useState([]);
  const [error, setError]                       = useState(null);

  const timeoutsRef = useRef([]);
  const legendRef   = useRef(null);
  const prevWinsRef = useRef(null);

  const clearTimeouts = () => { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []; };
  useEffect(() => () => clearTimeouts(), []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (legendRef.current && !legendRef.current.contains(e.target)) setShowLegend(false);
      if (prevWinsRef.current && !prevWinsRef.current.contains(e.target)) setShowPreviousWins(false);
    }
    if (showLegend || showPreviousWins) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLegend, showPreviousWins]);

  useEffect(() => {
    async function loadPrizes() {
      try {
        const data = await mockApi.fetchPrizes();
        const enriched = data.map(p => ({ ...p, emoji: EMOJI_MAP[p.id] ?? "🎁" }));
        setPrizes(enriched);
        setStrips(Array.from({ length: NUM_REELS }, () => buildStrip(enriched)));
      } catch (e) {
        setError("Failed to load prizes.");
      } finally {
        setLoadingPrizes(false);
      }
    }
    loadPrizes();
  }, []);

  const spin = async () => {
    if (spinning || !user?.spins || prizes.length === 0) return;
    setSpinning(true);
    setShowResult(false);
    setPaylineActive(false);
    setPrize(null);
    setError(null);
    setStopped(Array(NUM_REELS).fill(false));
    setStrips(Array.from({ length: NUM_REELS }, () => buildStrip(prizes)));

    let res;
    try {
      res = await mockApi.performSpin(user.id);
    } catch (e) {
      setError(e.message);
      setSpinning(false);
      setStopped(Array(NUM_REELS).fill(true));
      return;
    }

    const winningPrize = prizes.find(p => p.id === res.prize.id) ?? prizes[0];
    setUser({ spins: res.spinsLeft });

    STOP_DELAYS.forEach((delay, i) => {
      const t = setTimeout(() => {
        setStrips(prev => { const next = [...prev]; next[i] = buildStrip(prizes, winningPrize); return next; });
        setStopped(prev => { const next = [...prev]; next[i] = true; return next; });

        if (i === NUM_REELS - 1) {
          setTimeout(() => setPaylineActive(true), 100);
          setPrize(winningPrize);
          setPreviousWins(pw => [{ time: new Date().toLocaleTimeString(), ...winningPrize }, ...pw]);

          if (winningPrize.id === "JACKPOT") {
            confetti({ particleCount: 220, spread: 160, startVelocity: 60, origin: { y: 0.35 } });
            setTimeout(() => confetti({ particleCount: 120, spread: 200, startVelocity: 30, origin: { y: 0.3 } }), 200);
          } else {
            let end = Date.now() + 500;
            (function frame() {
              confetti({ particleCount: 8, startVelocity: 22, spread: 120, ticks: 60, origin: { x: Math.random(), y: Math.random() - 0.2 } });
              if (Date.now() < end) requestAnimationFrame(frame);
            })();
          }
          setTimeout(() => { setShowResult(true); setSpinning(false); }, 900);
        }
      }, delay);
      timeoutsRef.current.push(t);
    });
  };

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
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-8 right-8 h-px"
          style={{ background: "linear-gradient(90deg, transparent, var(--neon-violet), var(--neon-cyan), transparent)" }}
        />

        {/* Reels + payline */}
        <div className="relative mb-6">
          <AnimatePresence>
            {paylineActive && (
              <motion.div
                key="payline"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-x-0 z-20 pointer-events-none rounded-lg"
                style={{
                  top:       REEL_SYMBOL_HEIGHT,
                  height:    REEL_SYMBOL_HEIGHT,
                  border:    "1px solid rgba(255,215,0,0.8)",
                  background:"rgba(255,215,0,0.07)",
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

        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 left-8 right-8 h-px mb-[72px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(157,78,221,0.4), transparent)" }}
        />

        {/* Spin button */}
        {isLoggedIn ? (
          <motion.button
            onClick={spin}
            disabled={spinning || !user?.spins}
            whileHover={!spinning && user?.spins ? { scale: 1.03 } : {}}
            whileTap={!spinning && user?.spins ? { scale: 0.97 } : {}}
            className="w-full py-4 rounded-xl font-display tracking-widest text-xl relative overflow-hidden transition-all disabled:opacity-40"
            style={{
              background: spinning
                ? "rgba(157,78,221,0.2)"
                : "linear-gradient(135deg, #9D4EDD, #6B21A8)",
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
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
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

        {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
      </motion.div>

      {/* Panel buttons */}
      <div className="flex items-center gap-3">
        {isLoggedIn && (
          <button
            onClick={() => setShowPreviousWins(!showPreviousWins)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{
              background: "rgba(0,245,255,0.08)",
              border: "1px solid rgba(0,245,255,0.25)",
              color: "var(--neon-cyan)",
            }}
          >
            🎖️ Your Wins
          </button>
        )}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: "rgba(157,78,221,0.08)",
            border: "1px solid rgba(157,78,221,0.3)",
            color: "var(--neon-violet)",
          }}
        >
          ⛳ Legend
        </button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showLoginModal && <LoginModal onFinish={() => setShowLoginModal(false)} />}
      </AnimatePresence>

      {/* Legend panel — fixed right, below navbar */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            ref={legendRef}
            initial={{ x: 280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
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
            <div className="space-y-2">
              {prizes.map(({ id, fullName, emoji, rarity }) => (
                <div key={id} className="flex justify-between items-center text-sm py-1"
                  style={{ borderBottom: "1px solid rgba(157,78,221,0.1)" }}>
                  <span style={{ color: "var(--text-primary)" }}>{emoji} {id}</span>
                  <span style={{ color: rarity === "legendary" ? "var(--neon-gold)" : rarity === "uncommon" ? "var(--neon-cyan)" : "var(--text-muted)" }}>
                    {fullName}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Previous Wins panel — fixed left, below navbar */}
      <AnimatePresence>
        {showPreviousWins && (
          <motion.div
            ref={prevWinsRef}
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
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

      {/* Result modal */}
      <AnimatePresence>
        {showResult && prize && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowResult(false)} />
            <motion.div
              initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="relative z-10 rounded-2xl p-7 max-w-sm w-full"
              style={{
                background: "linear-gradient(160deg, #0f0f1f, #0a0a16)",
                border: "1px solid rgba(255,215,0,0.4)",
                boxShadow: "0 0 60px rgba(255,215,0,0.15), 0 24px 64px rgba(0,0,0,0.7)",
              }}
            >
              <div
                className="absolute top-0 left-8 right-8 h-px"
                style={{ background: "linear-gradient(90deg, transparent, var(--neon-gold), transparent)" }}
              />
              <h2 className="font-display tracking-widest text-3xl mb-5"
                style={{ color: prize.id === "JACKPOT" ? "var(--neon-gold)" : "var(--text-primary)" }}>
                {prize.id === "JACKPOT" ? "🏆 JACKPOT!!" : "🎁 YOU WON"}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-5xl" style={{ filter: `drop-shadow(0 0 12px rgba(255,215,0,0.6))` }}>
                  {prize.emoji}
                </span>
                <div>
                  <p className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>{prize.fullName}</p>
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    {prize.id === "TRYAGAIN" ? "Tough luck! Try again."
                      : prize.id === "JACKPOT" ? "Legendary pull — admin owes you a trophy."
                      : "Claim via the rewards panel."}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <motion.button
                  onClick={() => setShowResult(false)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-xl font-semibold text-sm"
                  style={{
                    background: "rgba(157,78,221,0.2)",
                    border: "1px solid rgba(157,78,221,0.5)",
                    color: "var(--text-primary)",
                  }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Reel ─────────────────────────────────────────────────────────────────────
function Reel({ strip, spinning, symbolHeight, isWinner, reelIndex }) {
  const visibleCount = 3;
  const windowHeight = symbolHeight * visibleCount;
  const stopOffset   = -(strip.length - visibleCount) * symbolHeight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reelIndex * 0.08 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        width:  symbolHeight,
        height: windowHeight,
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(157,78,221,0.25)",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Top/bottom fade masks */}
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
                height:    symbolHeight,
                opacity:   (!spinning && !isMiddleRow) ? 0.2 : 1,
                transform: isMiddleRow && isWinner ? "scale(1.18)" : "scale(1)",
              }}
            >
              <span className="text-4xl" style={{
                filter: isMiddleRow && isWinner
                  ? "drop-shadow(0 0 12px rgba(255,215,0,0.8))"
                  : "none"
              }}>
                {prize.emoji}
              </span>
              <span className="text-[9px] font-semibold mt-1 tracking-widest"
                style={{ color: isMiddleRow && isWinner ? "var(--neon-gold)" : "var(--text-muted)" }}>
                {prize.id}
              </span>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}