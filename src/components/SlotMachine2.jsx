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
const REEL_SYMBOL_HEIGHT = 80;
const SYMBOLS_PER_REEL   = 24;
const STOP_DELAYS        = [1400, 2300, 3200]; // ms — sequential reel stops

// Place anchorPrize at index (length - 2) so it lands in the middle visible row
function buildStrip(prizes, anchorPrize = null) {
  const strip = Array.from({ length: SYMBOLS_PER_REEL }, () =>
    prizes[Math.floor(Math.random() * prizes.length)]
  );
  if (anchorPrize) {
    strip[SYMBOLS_PER_REEL - 2] = anchorPrize; // middle of last 3 visible
  }
  return strip;
}

export default function SlotMachine() {
  const { isLoggedIn, user, setUser } = useAuth();

  const [prizes, setPrizes]               = useState([]);
  const [loadingPrizes, setLoadingPrizes] = useState(true);
  const [spinning, setSpinning]           = useState(false);
  const [strips, setStrips]               = useState([]);
  const [stopped, setStopped]             = useState(Array(NUM_REELS).fill(true));
  const [paylineActive, setPaylineActive] = useState(false);
  const [prize, setPrize]                 = useState(null);
  const [showResult, setShowResult]       = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [previousWins, setPreviousWins]   = useState([]);
  const [error, setError]                 = useState(null);

  const timeoutsRef = useRef([]);
  const clearTimeouts = () => { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []; };
  useEffect(() => () => clearTimeouts(), []);

  // Load prizes from mockApi
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

    // All reels anchor to the winning prize — they just stop at different times
    STOP_DELAYS.forEach((delay, i) => {
      const t = setTimeout(() => {
        setStrips(prev => {
          const next = [...prev];
          next[i] = buildStrip(prizes, winningPrize); // all reels land on winner
          return next;
        });
        setStopped(prev => {
          const next = [...prev]; next[i] = true; return next;
        });

        if (i === NUM_REELS - 1) {
          // All reels stopped — fire payline highlight then result
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

          setTimeout(() => {
            setShowResult(true);
            setSpinning(false);
          }, 900); // slight delay so user can enjoy the payline moment
        }
      }, delay);
      timeoutsRef.current.push(t);
    });
  };

  if (loadingPrizes) {
    return (
      <div className="flex flex-col items-center mt-20 gap-4 text-white/70">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-4xl"
        >🎰</motion.div>
        <p className="text-sm">Loading prizes…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 mt-10 w-full max-w-lg">

      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-wide drop-shadow">🎰 Slot Machine</h1>
        {isLoggedIn && (
          <p className="text-white/70 mt-1 text-sm">
            {user.spins} spin{user.spins !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>

      {/* Machine body */}
      <div className="bg-gray-900 rounded-3xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.5)] border border-purple-500/40 w-full">

        {/* Reels + payline wrapper */}
        <div className="relative mb-6">

          {/* Payline highlight — spans full width, sits on middle row */}
          <AnimatePresence>
            {paylineActive && (
              <motion.div
                key="payline"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-x-0 z-20 pointer-events-none rounded-lg border-2 border-yellow-400"
                style={{
                  top:    REEL_SYMBOL_HEIGHT,        // skip top row
                  height: REEL_SYMBOL_HEIGHT,        // cover middle row only
                  background: "rgba(234,179,8,0.12)",
                  boxShadow: "0 0 18px 4px rgba(234,179,8,0.45)",
                }}
              />
            )}
          </AnimatePresence>

          {/* Reels */}
          <div className="flex gap-3 justify-center">
            {strips.map((strip, reelIdx) => (
              <Reel
                key={reelIdx}
                strip={strip}
                spinning={!stopped[reelIdx]}
                symbolHeight={REEL_SYMBOL_HEIGHT}
                isWinner={paylineActive}
              />
            ))}
          </div>
        </div>

        {/* Spin button */}
        {isLoggedIn ? (
          <button
            onClick={spin}
            disabled={spinning || !user?.spins}
            className="w-full py-3 bg-yellow-400 text-gray-900 font-extrabold text-lg rounded-xl shadow-lg hover:bg-yellow-300 disabled:opacity-40 transition-all active:scale-95"
          >
            {spinning ? "Spinning…" : user?.spins ? "SPIN" : "No Spins Left"}
          </button>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full py-3 bg-slate-500 text-white font-extrabold text-lg rounded-xl hover:bg-slate-400 transition-all"
          >
            Login to Play
          </button>
        )}

        {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
      </div>

      {/* Recent wins */}
      {isLoggedIn && previousWins.length > 0 && (
        <div className="w-full bg-white/10 rounded-2xl p-4 max-h-48 overflow-y-auto">
          <h3 className="font-bold mb-2 text-sm uppercase tracking-widest text-white/60">Recent Wins</h3>
          {previousWins.map((w, i) => (
            <div key={i} className="flex justify-between text-sm py-1 border-b border-white/10">
              <span>{w.emoji} {w.fullName}</span>
              <span className="text-white/50">{w.time}</span>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showLoginModal && <LoginModal onFinish={() => setShowLoginModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showResult && prize && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResult(false)} />
            <motion.div
              initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="relative z-10 bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-gray-900"
            >
              <h2 className="text-2xl font-extrabold mb-4">
                {prize.id === "JACKPOT" ? "🏆 JACKPOT!!" : "🎁 You Won!"}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{prize.emoji}</span>
                <div>
                  <p className="text-lg font-semibold">{prize.fullName}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {prize.id === "TRYAGAIN" ? "Tough luck! Try again."
                      : prize.id === "JACKPOT" ? "Legendary pull — admin owes you a trophy."
                      : "Claim via the rewards panel."}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowResult(false)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Reel ─────────────────────────────────────────────────────────────────────
function Reel({ strip, spinning, symbolHeight, isWinner }) {
  const visibleCount = 3;
  const windowHeight = symbolHeight * visibleCount;

  // Stop at (length - 3) * height so the last 3 symbols are visible,
  // putting the anchor (at length - 2) squarely in the middle row
  const stopOffset = -(strip.length - visibleCount) * symbolHeight;

  return (
    <div
      className="relative overflow-hidden rounded-xl border-2 bg-gray-800 transition-all duration-300"
      // className="relative overflow-hidden rounded-xl border-2 bg-gray-800 transition-all duration-300"
      style={{
        width:  symbolHeight,
        height: windowHeight,
        borderColor: "rgba(168,85,247,0.6)",
        // borderColor: isWinner ? "rgb(234,179,8)" : "rgba(168,85,247,0.6)",
        // boxShadow: isWinner ? "0 0 14px rgba(234,179,8,0.5)" : "none",
      }}
    >
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
              className="flex flex-col items-center justify-center font-bold text-white transition-all duration-300"
              style={{
                height:  symbolHeight,
                opacity: (!spinning && !isMiddleRow) ? 0.35 : 1,
                transform: isMiddleRow && isWinner ? "scale(1.15)" : "scale(1)",
              }}
            >
              <span className="text-3xl">{prize.emoji}</span>
              <span className="text-[10px] text-white/60 mt-1">{prize.id}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
} 