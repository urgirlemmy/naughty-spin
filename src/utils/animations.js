// ── Shared Framer Motion variants for Naughty Spin ────────────────────────────
// Usage: <motion.div variants={fadeIn} initial="hidden" animate="visible" />

// ── Fade ─────────────────────────────────────────────────────────────────────
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

// ── Scale + Fade (modals, cards) ──────────────────────────────────────────────
export const scaleUp = {
  hidden:  { opacity: 0, scale: 0.85, y: 20 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { type: "spring", stiffness: 220, damping: 20 } },
  exit:    { opacity: 0, scale: 0.9,  y: 10, transition: { duration: 0.15 } },
};

// ── Slide in from right (legend panel) ───────────────────────────────────────
export const slideInRight = {
  hidden:  { opacity: 0, x: 280 },
  visible: { opacity: 1, x: 0,   transition: { type: "spring", stiffness: 200, damping: 22 } },
  exit:    { opacity: 0, x: 280, transition: { duration: 0.2 } },
};

// ── Slide in from left (previous wins panel) ──────────────────────────────────
export const slideInLeft = {
  hidden:  { opacity: 0, x: -280 },
  visible: { opacity: 1, x: 0,    transition: { type: "spring", stiffness: 200, damping: 22 } },
  exit:    { opacity: 0, x: -280, transition: { duration: 0.2 } },
};

// ── Slide down from top (dropdown menus) ──────────────────────────────────────
export const slideDown = {
  hidden:  { opacity: 0, scale: 0.92, y: -6 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { type: "spring", stiffness: 240, damping: 20 } },
  exit:    { opacity: 0, scale: 0.92, y: -6, transition: { duration: 0.15 } },
};

// ── Stagger container (lists, grids) ──────────────────────────────────────────
export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

// ── Stagger child item ────────────────────────────────────────────────────────
export const staggerItem = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: { type: "spring", stiffness: 200, damping: 18 } },
};

// ── Page entry (full page transitions) ───────────────────────────────────────
export const pageEnter = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.45, ease: "easeOut" } },
};

// ── Payline sweep (slot machine) ──────────────────────────────────────────────
export const paylineSweep = {
  hidden:  { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit:    { opacity: 0,            transition: { duration: 0.2 } },
};

// ── Spin button pulse (idle state) ────────────────────────────────────────────
export const spinButtonPulse = {
  idle:     { boxShadow: "0 0 24px rgba(157,78,221,0.5)" },
  spinning: { boxShadow: "0 0 8px rgba(157,78,221,0.2)" },
};

// ── Reel entry (staggered per reel index) ─────────────────────────────────────
export const reelEntry = (index) => ({
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: index * 0.08, type: "spring", stiffness: 200, damping: 18 } },
});