import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  BiBullseye
} from "react-icons/bi";
import LoginModal from "./LoginModal";
import { useAuth } from "../providers/AuthProvider";
import { mockApi } from "../utils/mockApi";

// Instead of simple strings, use backend-style objects
const prizes = [
  { id: "PRZ100", fullName: "₹100" },
  { id: "COFFEE1", fullName: "Free Coffee" },
  { id: "XPBOOST", fullName: "Bonus XP" },
  { id: "TRYAGAIN", fullName: "Try Again" },
  { id: "PRZ005", fullName: "₹5" },
  { id: "JACKPOT", fullName: "Jackpot!" },
];

const numSegments = prizes.length;
const segmentAngle = 360 / numSegments;
const SPIN_DURATION_MS = 4000;

export default function SpinWheel() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [showLegend, setShowLegend] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [jackpotGlow, setJackpotGlow] = useState(false);
  const [previousWins, setPreviousWins] = useState([]);
  const [showPreviousWins, setShowPreviousWins] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { isLoggedIn, user, setUser } = useAuth();

  const wheelRef = useRef(null);
  const spinTimeoutRef = useRef(null);
  const tickIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const legendRef = useRef(null);
  const prevWinsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (legendRef.current && !legendRef.current.contains(e.target)) {
        setShowLegend(false);
      }
      if (prevWinsRef.current && !prevWinsRef.current.contains(e.target)) {
        setShowPreviousWins(false);
      }
    }
    if (showLegend || showPreviousWins) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLegend, showPreviousWins]);


  // compute segment width just for visual layout (optional)
  useEffect(() => {
    const radius = 150; // half of 300px wheel
    const radians = segmentAngle * (Math.PI / 180);
    const width = 2 * radius * Math.sin(radians / 2);
    setSegmentWidth(width);
  }, []);

  // Create an oscillator "tick" for each segment using Web Audio API
  const tickOnce = (time = 0) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(1200, ctx.currentTime + time); // high-pitched tick
      g.gain.setValueAtTime(0.001, ctx.currentTime + time);
      // quick envelope
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + time + 0.001);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.08);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(ctx.currentTime + time);
      o.stop(ctx.currentTime + time + 0.09);
    } catch (e) {
      // AudioContext might be blocked by Autoplay policies in some browsers.
      // Ignore silently if audio unavailable.
      // console.warn("tick failed", e);
    }
  };

  // shoot confetti - with special jackpot mode
  const shootConfetti = (isJackpot = false) => {
    if (isJackpot) {
      confetti({
        particleCount: 220,
        spread: 160,
        startVelocity: 60,
        scalar: 1.2,
        origin: { y: 0.35 },
      });
      // extra multi-shot for drama
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 200,
          startVelocity: 30,
          origin: { y: 0.3 },
        });
      }, 200);
    } else {
      let end = Date.now() + 500;
      (function frame() {
        confetti({
          particleCount: 8,
          startVelocity: 22,
          spread: 120,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  };

  // main spin function
  const spinWheel = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedPrize(null);
    setJackpotGlow(false);

    // random spin target in [0, 360)
    const randomSpin = Math.floor(Math.random() * numSegments) * segmentAngle;
    const totalRotation = rotation + 360 * 5 + randomSpin;
    setRotation(totalRotation);

    // play ticks during SPIN_DURATION_MS, synced roughly to number of segments passed
    const ticksCount = Math.max(12, Math.floor((SPIN_DURATION_MS / 100) * (numSegments / 3))); // heuristic
    // we want tick frequency faster initially and slower toward the end to mimic ease-out.
    // We'll schedule ticks with increasing intervals via setInterval replacement using recursive timeouts.
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3); // cubic ease-out for timing
    let tickIndex = 0;

    const scheduleTick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / SPIN_DURATION_MS);
      // map t -> mappedT in [0,1] using easeOut so ticks slow down
      const mappedT = easeOut(t);
      // determine next tick delay (short at start, long at end)
      const baseDelay = 40; // ms
      const maxDelay = 260; // ms
      const delay = baseDelay + mappedT * (maxDelay - baseDelay);

      // fire a tick
      tickOnce();

      tickIndex += 1;
      if (now - start < SPIN_DURATION_MS) {
        tickIntervalRef.current = window.setTimeout(scheduleTick, delay);
      }
    };

    // start the ticking (first tick immediate)
    scheduleTick();

    const res = await mockApi.performSpin(user.id);
    if (res.ok) {
      setSelectedPrize(res.prize);
      setUser({ spins: res.spinsLeft });
      const prize = res.prize;

      // after spin duration show winning slot
      spinTimeoutRef.current = window.setTimeout(() => {
        // clear any pending tick timeouts
        if (tickIntervalRef.current) {
          clearTimeout(tickIntervalRef.current);
          tickIntervalRef.current = null;
        }

        // const winningIndex = (numSegments - Math.floor(randomSpin / segmentAngle)) % numSegments;
        // const prize = prizes[winningIndex];
        // setSelectedPrize(prize);
        setPreviousWins((prev) => [
          { time: new Date().toLocaleTimeString(), ...prize },
          ...prev,
        ]);

        setShowResult(true);

        // confetti and special sound if jackpot
        if (prize.id === "JACKPOT") {
          shootConfetti(true);
          setJackpotGlow(true);

          tickOnce();
          setTimeout(() => tickOnce(), 120);
          setTimeout(() => tickOnce(), 240);
        } else {
          shootConfetti(false);
          setJackpotGlow(false);
        }

        setIsSpinning(false);
      }, SPIN_DURATION_MS);
    } else {
      // display some error somehow
      console.log("There was an error");
      setIsSpinning(false);
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
      if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) { }
        audioCtxRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 mt-10">
      <div className="relative flex flex-col items-center justify-center rounded-full shadow-[0_0_25px_rgba(103,58,183,0.7)]">
        {/* wheel */}
        <motion.div
          ref={wheelRef}
          className="relative rounded-full flex items-center justify-center overflow-hidden border-[10px] border-[#673ab7]"
          animate={{ rotate: rotation }}
          transition={{ duration: SPIN_DURATION_MS / 1000, ease: "easeOut" }}
          style={{
            height: "300px",
            width: "300px",
          }}
        >
          {prizes.map(({ id, fullName }, index) => (
            <div
              key={id}
              className={`absolute flex items-center justify-center ${jackpotGlow && selectedPrize?.id === id && id === "JACKPOT"
                ? "animate-pulse"
                : ""
                }`}
              style={{
                // transform: `rotate(${index * segmentAngle}deg) translateY(50%)`,
                clipPath: "polygon(50% 0%, -8% 100%, 100% 100%)",
                height: "50%",
                width: `${segmentWidth}px`,
                zIndex: numSegments - index,
                background:
                  selectedPrize && selectedPrize.id === id
                    ? jackpotGlow && id === "JACKPOT"
                      ? "#ffeb3b"  // flashy gold for jackpot
                      : "#d8b4fe"
                    // same base highlight color
                    : index % 2 === 0
                      ? "#f84235ff"
                      : "#371ccfff",
                transform: `rotate(${index * segmentAngle}deg) translateY(50%) 
  ${selectedPrize && selectedPrize.id === id ? "scale(1.06)" : ""}`,
                transition: "all 0.3s ease-out",
                boxShadow:
                  selectedPrize && selectedPrize.id === id
                    ? jackpotGlow && id === "JACKPOT"
                      ? "0 0 30px 8px rgba(255, 230, 0, 0.9), inset 0 0 20px #fff59d"
                      : "0 0 18px rgba(255,255,150,0.9), inset 0 10px 10px #ffffff"
                    : "inset 0px 0px 0px #bebebe, inset 0px 10px 10px #ffffff"
              }}
            >
              <span className="text-xs font-bold text-white bg-gray-900 px-2 py-1 rounded mt-6">
                {id}
              </span>
            </div>
          ))}
        </motion.div>

        {/* middle dot */}
        <div className="absolute top-1/2 left-1/2 w-[70px] h-[70px] bg-gray-900 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-[10]">
          <div className="text-5xl" style={{ fill: "goldenrod" }}>
            <BiBullseye />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3">
        {isLoggedIn ? (
          <button
            onClick={spinWheel}
            disabled={isSpinning || !user.spins}
            className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 disabled:opacity-50 transition-all"
          >
            {isSpinning ? "Spinning..." : "Spin the Wheel"}
          </button>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-3 bg-slate-400 text-slate-50 font-bold rounded-full shadow-lg hover:bg-yellow-300 disabled:opacity-50 transition-all"
          >
            Login to Play
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isLoggedIn && (
          <button
            onClick={() => setShowPreviousWins(!showPreviousWins)}
            className="bg-gray-900 text-white px-3 py-2 rounded-xl shadow hover:bg-gray-800 transition"
          >
            🎖️ Your Wins
          </button>
        )}

        <button
          onClick={() => setShowLegend(!showLegend)}
          className="bg-gray-900 text-white px-3 py-2 rounded-xl shadow hover:bg-gray-800 transition"
        >
          ⛳ Legend
        </button>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal onFinish={() => setShowLoginModal(false)} />
        )}
      </AnimatePresence>

      {/* Legend Modal */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            ref={legendRef}
            initial={{ x: 250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 250, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="fixed right-4 top-24 bg-white shadow-lg rounded-lg p-4 w-64 z-50 border border-purple-200"
          >
            <h2 className="text-black font-bold text-lg mb-2">Prize Legend ⛳</h2>

            <div className="space-y-1">
              {prizes.map(({ id, fullName }) => (
                <div key={id} className="flex justify-between text-sm font-medium">
                  <span className="text-gray-700">{id}</span>
                  <span className="text-gray-500">{fullName}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Previous Wins */}
      <AnimatePresence>
        {showPreviousWins && (
          <motion.div
            ref={prevWinsRef}
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="fixed left-4 top-24 flex flex-col bg-white shadow-lg rounded-lg p-4 w-64 z-50 border border-purple-200 max-h-80"
          >
            <h2 className="text-black font-bold text-lg mb-2">Previous Wins 🏅</h2>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1 flex-grow-1">
              {previousWins.length === 0 && (
                <p className="text-sm text-gray-500 italic">No wins yet… spin king 👑</p>
              )}

              {previousWins.map((w, i) => (
                <div key={i} className="border rounded-lg p-2 bg-gray-50 text-sm">
                  <p className="font-medium text-black">({w.id}) {w.fullName}</p>
                  <p className="text-xs text-gray-500">{w.time}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {selectedPrize && showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden
            />
            <div className="relative z-10 max-w-md w-full bg-white rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-3">
                You Won
              </h2>

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-4xl font-bold text-[#673ab7]">
                    🎁
                  </div>

                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    ({selectedPrize.id}) {selectedPrize.fullName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedPrize.id === "TRYAGAIN"
                      ? "Tough luck! Try again."
                      : selectedPrize.id === "JACKPOT"
                        ? "Legendary pull — admin owes you a trophy."
                        : "Claim this prize via the rewards panel."}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowResult(false)}
                  className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-400"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
