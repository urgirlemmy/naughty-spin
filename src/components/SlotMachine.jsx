import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "../providers/AuthProvider";
import { mockApi } from "../utils/mockApi";
import LoginModal from "./LoginModal";

// Emoji lookup — keyed by prize ID, fallback to 🎁
const EMOJI_MAP = {
  PRZ100:  "💰",
  COFFEE1: "☕",
  XPBOOST: "⚡",
  TRYAGAIN:"🔄",
  PRZ005:  "🪙",
  JACKPOT: "🎰",
};

const NUM_REELS = 3;
const REEL_SYMBOL_HEIGHT = 80;
const SYMBOLS_PER_REEL = 20;
const STOP_DELAYS = [1200, 2000, 2900];

function buildStrip(prizes, anchorPrize = null) {
  const strip = Array.from({ length: SYMBOLS_PER_REEL }, () =>
    prizes[Math.floor(Math.random() * prizes.length)]
  );
  if (anchorPrize) strip[strip.length - 1] = anchorPrize;
  return strip;
}

export default function SlotMachine() {
  const { isLoggedIn, user, setUser } = useAuth();

  const [prizes, setPrizes]           = useState([]);
  const [loadingPrizes, setLoadingPrizes] = useState(true);
  const [spinning, setSpinning]       = useState(false);
  const [strips, setStrips]           = useState([]);
  const [stopped, setStopped]         = useState(Array(NUM_REELS).fill(true));
  const [prize, setPrize]             = useState(null);
  const [showResult, setShowResult]   = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [previousWins, setPreviousWins] = useState([]);
  const [error, setError]             = useState(null);

  const timeoutsRef = useRef([]);
  const clearTimeouts = () => { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []; };
  useEffect(() => () => clearTimeouts(), []);

  // ── Fetch prizes from mockApi on mount ──────────────────────────────────────
  useEffect(() => {
    async function loadPrizes() {
      try {
        const data = await mockApi.fetchPrizes();
        // Enrich with emoji
        const enriched = data.map(p => ({
          ...p,
          emoji: EMOJI_MAP[p.id] ?? "🎁",
        }));
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

    // Match returned prize against enriched list (so we have the emoji)
    const winningPrize = prizes.find(p => p.id === res.prize.id) ?? prizes[0];
    setUser({ spins: res.spinsLeft });

    STOP_DELAYS.forEach((delay, i) => {
      const t = setTimeout(() => {
        const isLast = i === NUM_REELS - 1;
        setStrips(prev => {
          const next = [...prev];
          next[i] = buildStrip(prizes, isLast ? winningPrize : null);
          return next;
        });
        setStopped(prev => {
          const next = [...prev]; next[i] = true; return next;
        });

        if (isLast) {
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

          setTimeout(() => { setShowResult(true); setSpinning(false); }, 300);
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
        >
          🎰
        </motion.div>
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

      <div className="bg-gray-900 rounded-3xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.5)] border border-purple-500/40 w-full">
        <div className="flex gap-3 justify-center mb-6">
          {strips.map((strip, reelIdx) => (
            <Reel
              key={reelIdx}
              strip={strip}
              spinning={!stopped[reelIdx]}
              symbolHeight={REEL_SYMBOL_HEIGHT}
            />
          ))}
        </div>

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
                <button onClick={() => setShowResult(false)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">
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
function Reel({ strip, spinning, symbolHeight }) {
  const visibleCount = 3;
  const windowHeight = symbolHeight * visibleCount;
  const stopOffset = -(strip.length - visibleCount) * symbolHeight;

  return (
    <div
      className="relative overflow-hidden rounded-xl border-2 border-purple-500/60 bg-gray-800"
      style={{ width: symbolHeight, height: windowHeight }}
    >
      <div
        className="absolute inset-x-0 z-10 border-y-2 border-yellow-400/70 pointer-events-none"
        style={{ top: symbolHeight, height: symbolHeight }}
      />
      <motion.div
        animate={spinning
          ? { y: [0, -strip.length * symbolHeight * 0.5, 0] }
          : { y: stopOffset }
        }
        transition={spinning
          ? { duration: 0.4, repeat: Infinity, ease: "linear" }
          : { duration: 0.35, ease: "easeOut" }
        }
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      >
        {strip.map((prize, i) => (
          <div key={i} className="flex flex-col items-center justify-center font-bold text-white" style={{ height: symbolHeight }}>
            <span className="text-3xl">{prize.emoji}</span>
            <span className="text-[10px] text-white/60 mt-1">{prize.id}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}