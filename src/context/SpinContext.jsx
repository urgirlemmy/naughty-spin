import { createContext, useContext, useState, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "../providers/AuthProvider";
import { mockApi } from "../utils/mockApi";

const SpinContext = createContext(null);

const EMOJI_MAP = {
  PRZ100:   "💰",
  COFFEE1:  "☕",
  XPBOOST:  "⚡",
  TRYAGAIN: "🔄",
  PRZ005:   "🪙",
  JACKPOT:  "🎰",
};

const NUM_REELS        = 3;
const SYMBOLS_PER_REEL = 24;
const STOP_DELAYS      = [1400, 2300, 3200];

export function buildStrip(prizes, anchorPrize = null) {
  const strip = Array.from({ length: SYMBOLS_PER_REEL }, () =>
    prizes[Math.floor(Math.random() * prizes.length)]
  );
  if (anchorPrize) strip[SYMBOLS_PER_REEL - 2] = anchorPrize;
  return strip;
}

export function SpinProvider({ children }) {
  const { user, setUser } = useAuth();

  const [prizes, setPrizes]                     = useState([]);
  const [loadingPrizes, setLoadingPrizes]       = useState(true);
  const [spinning, setSpinning]                 = useState(false);
  const [strips, setStrips]                     = useState([]);
  const [stopped, setStopped]                   = useState(Array(NUM_REELS).fill(true));
  const [paylineActive, setPaylineActive]       = useState(false);
  const [prize, setPrize]                       = useState(null);
  const [showResult, setShowResult]             = useState(false);
  const [previousWins, setPreviousWins]         = useState([]);
  const [error, setError]                       = useState(null);

  const timeoutsRef = useRef([]);
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const loadPrizes = useCallback(async () => {
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
  }, []);

  const shootConfetti = useCallback((isJackpot) => {
    if (isJackpot) {
      confetti({ particleCount: 220, spread: 160, startVelocity: 60, origin: { y: 0.35 } });
      setTimeout(() => confetti({ particleCount: 120, spread: 200, startVelocity: 30, origin: { y: 0.3 } }), 200);
    } else {
      let end = Date.now() + 500;
      (function frame() {
        confetti({ particleCount: 8, startVelocity: 22, spread: 120, ticks: 60, origin: { x: Math.random(), y: Math.random() - 0.2 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, []);

  const spin = useCallback(async () => {
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
        setStrips(prev => {
          const next = [...prev];
          next[i] = buildStrip(prizes, winningPrize);
          return next;
        });
        setStopped(prev => {
          const next = [...prev]; next[i] = true; return next;
        });

        if (i === NUM_REELS - 1) {
          setTimeout(() => setPaylineActive(true), 100);
          setPrize(winningPrize);
          setPreviousWins(pw => [
            { time: new Date().toLocaleTimeString(), ...winningPrize },
            ...pw,
          ]);
          shootConfetti(winningPrize.id === "JACKPOT");
          setTimeout(() => { setShowResult(true); setSpinning(false); }, 900);
        }
      }, delay);
      timeoutsRef.current.push(t);
    });
  }, [spinning, user, prizes, setUser, shootConfetti]);

  return (
    <SpinContext.Provider value={{
      // Prize data
      prizes,
      loadingPrizes,
      loadPrizes,
      // Reel state
      strips,
      stopped,
      paylineActive,
      NUM_REELS,
      SYMBOLS_PER_REEL,
      // Spin state
      spinning,
      spin,
      error,
      // Result
      prize,
      showResult,
      setShowResult,
      // History
      previousWins,
    }}>
      {children}
    </SpinContext.Provider>
  );
}

export function useSpin() {
  return useContext(SpinContext);
}