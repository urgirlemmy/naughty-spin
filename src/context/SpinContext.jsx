import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "../providers/AuthProvider";
import { prizesApi, spinsApi } from "../utils/api";

const SpinContext = createContext(null);

const NUM_REELS = 3;
const SYMBOLS_PER_REEL = 24;
const STOP_DELAYS = [1400, 2300, 3200];

export function buildStrip(prizes, anchorPrize = null) {
  const strip = Array.from({ length: SYMBOLS_PER_REEL }, () =>
    prizes[Math.floor(Math.random() * prizes.length)]
  );
  if (anchorPrize) strip[SYMBOLS_PER_REEL - 2] = anchorPrize;
  return strip;
}

export function SpinProvider({ children }) {
  const { user, setUser } = useAuth();

  const [prizes, setPrizes] = useState([]);
  const [loadingPrizes, setLoadingPrizes] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [strips, setStrips] = useState([]);
  const [stopped, setStopped] = useState(Array(NUM_REELS).fill(true));
  const [paylineActive, setPaylineActive] = useState(false);
  const [prize, setPrize] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [previousWins, setPreviousWins] = useState([]);
  const [error, setError] = useState(null);

  const timeoutsRef = useRef([]);
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);
  useEffect(() => () => clearTimeouts(), [clearTimeouts]);

  const loadPrizes = useCallback(async () => {
    setLoadingPrizes(true);
    const res = await prizesApi.list();
    if (res.ok) {
      // Backend returns snake_case — normalise for frontend use
      const normalised = res.data.prizes.map(p => ({
        id: p.id,
        code: p.code,
        fullName: p.full_name,
        emoji: p.emoji,
        rarity: p.rarity,
        weight: p.weight,
      }));
      setPrizes(normalised);
      setStrips(Array.from({ length: NUM_REELS }, () => buildStrip(normalised)));
    } else {
      setError('Failed to load prizes.');
    }
    setLoadingPrizes(false);
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

    const res = await spinsApi.perform();

    if (!res.ok) {
      setError(res.error);
      setSpinning(false);
      setStopped(Array(NUM_REELS).fill(true));
      return;
    }

    // Backend returns { spin_id, prize: { id, code, full_name, emoji, rarity }, spins_left }
    const rawPrize = res.data.prize;
    const spinsLeft = res.data.spins_left;

    // Normalise to frontend shape
    const winningPrize = {
      id: rawPrize.id,
      code: rawPrize.code,
      fullName: rawPrize.full_name,
      emoji: rawPrize.emoji,
      rarity: rawPrize.rarity,
    };

    // Match against loaded prizes list (same code)
    const matchedPrize = prizes.find(p => p.code === winningPrize.code) ?? winningPrize;

    setUser({ spins: spinsLeft });

    STOP_DELAYS.forEach((delay, i) => {
      const t = setTimeout(() => {
        setStrips(prev => {
          const next = [...prev];
          next[i] = buildStrip(prizes, matchedPrize);
          return next;
        });
        setStopped(prev => {
          const next = [...prev]; next[i] = true; return next;
        });

        if (i === NUM_REELS - 1) {
          setTimeout(() => setPaylineActive(true), 100);
          setPrize(matchedPrize);
          setPreviousWins(pw => [
            { time: new Date().toLocaleTimeString(), ...matchedPrize },
            ...pw,
          ]);
          shootConfetti(matchedPrize.code === 'JACKPOT');
          setTimeout(() => { setShowResult(true); setSpinning(false); }, 900);
        }
      }, delay);
      timeoutsRef.current.push(t);
    });
  }, [spinning, user, prizes, setUser, shootConfetti]);

  return (
    <SpinContext.Provider value={{
      prizes, loadingPrizes, loadPrizes,
      strips, stopped, paylineActive,
      NUM_REELS, SYMBOLS_PER_REEL,
      spinning, spin, error,
      prize, showResult, setShowResult,
      previousWins,
    }}>
      {children}
    </SpinContext.Provider>
  );
}

export function useSpin() {
  return useContext(SpinContext);
}