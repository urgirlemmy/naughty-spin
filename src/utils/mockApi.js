// src/mockApi.js
// Frontend-only mock backend (in-memory). No localStorage, no persistence across reloads.
// Small latency to mimic real network (100-400ms).

const randDelay = (min = 80, max = 320) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

let _users = {
  // userId: { id, username, spins, isAdmin }
  // example pre-seeded admin:
  1: { id: 1, username: "admin", spins: 10, isAdmin: true },
  2: { id: 2, username: "user1", spins: 3, password: "password" },
};
let _nextUserId = 3;

let _prizes = [
  { id: "PRZ100", fullName: "₹100", rarity: "common" },
  { id: "COFFEE1", fullName: "Free Coffee", rarity: "common" },
  { id: "XPBOOST", fullName: "Bonus XP", rarity: "uncommon" },
  { id: "TRYAGAIN", fullName: "Try Again", rarity: "common" },
  { id: "PRZ005", fullName: "₹5", rarity: "common" },
  { id: "JACKPOT", fullName: "Jackpot!", rarity: "legendary" },
];

let _previousWins = [
  // { userId, time, prizeId, prizeName }
];

export const mockApi = {
  // Auth
  register: ({ username = "", password = "" } = {}) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const taken = Object.values(_users).find(u => u.username === username);
        if (taken) {
          resolve({ ok: false, error: "Username already taken." });
          return;
        }
        const id = _nextUserId++;
        const newUser = { id, username, password, email: null, spins: 5, isAdmin: false };
        _users[id] = newUser;
        const { password: _, ...safeUser } = newUser;
        resolve({ ok: true, user: safeUser });
      }, randDelay());
    }),

  login: ({ username = "", password = "" } = {}) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const found = Object.values(_users).find(u => u.username === username);
        if (!found) {
          resolve({ ok: false, error: "User not found." });
          return;
        }
        if (found.password !== password) {
          resolve({ ok: false, error: "Incorrect password." });
          return;
        }
        const { password: _, ...safeUser } = found;
        resolve({ ok: true, user: safeUser });
      }, randDelay());
    }), 

  logout: () =>
    new Promise((resolve) => {
      setTimeout(() => resolve({ ok: true }), randDelay());
    }),

  // Users
  listUsers: () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(Object.values(_users).map((u) => ({ ...u }))), randDelay());
    }),

  getUser: (userId) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(_users[userId] ? { ..._users[userId] } : null), randDelay());
    }),

  // Spins
  getSpins: (userId) =>
    new Promise((resolve) => {
      setTimeout(() => resolve((_users[userId] && _users[userId].spins) || 0), randDelay());
    }),

  updateSpins: (userId, newSpins) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!_users[userId]) return reject(new Error("User not found"));
        _users[userId].spins = newSpins;
        resolve({ ok: true, spins: newSpins });
      }, randDelay());
    }),

  // Prizes
  fetchPrizes: () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(_prizes.map((p) => ({ ...p }))), randDelay());
    }),

  addPrize: (prize) =>
    new Promise((resolve) => {
      setTimeout(() => {
        _prizes.push({ ...prize });
        resolve({ ok: true, prizes: _prizes.map((p) => ({ ...p })) });
      }, randDelay());
    }),

  removePrize: (id) =>
    new Promise((resolve) => {
      setTimeout(() => {
        _prizes = _prizes.filter((p) => p.id !== id);
        resolve({ ok: true, prizes: _prizes.map((p) => ({ ...p })) });
      }, randDelay());
    }),

  // Spins/wins simulation: performSpin selects random prize and decrements one spin
  performSpin: (userId) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = _users[userId];
        console.log(_users)
        if (!user) return reject(new Error("User not found"));
        if (user.spins <= 0) return reject(new Error("No spins left"));

        // simple random pick weighted equally (you can change)
        const idx = Math.floor(Math.random() * _prizes.length);
        const prize = _prizes[idx];

        // decrement spin
        user.spins -= 1;

        const record = {
          userId,
          time: new Date().toLocaleString(),
          prizeId: prize.id,
          prizeName: prize.fullName,
        };
        _previousWins.unshift(record);

        resolve({
          ok: true,
          prize: { ...prize },
          spinsLeft: user.spins,
          record,
        });
      }, randDelay(300, 900)); // slightly longer for spin
    }),

  // Previous wins
  fetchPreviousWins: (userId, limit = 50) =>
    new Promise((resolve) => {
      setTimeout(
        () =>
          resolve(
            _previousWins
              .filter((r) => r.userId === userId)
              .slice(0, limit)
              .map((r) => ({ ...r }))
          ),
        randDelay()
      );
    }),

  // Admin helpers
  giveSpins: (targetUserId, amount) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!_users[targetUserId]) return reject(new Error("User not found"));
        _users[targetUserId].spins += amount;
        resolve({ ok: true, user: { ..._users[targetUserId] } });
      }, randDelay());
    }),

  reset: () =>
    new Promise((resolve) => {
      setTimeout(() => {
        // reset to defaults
        _users = { 1: { id: 1, username: "admin", spins: 10, isAdmin: true } };
        _nextUserId = 2;
        _previousWins = [];
        _prizes = [
          { id: "PRZ100", fullName: "₹100", rarity: "common" },
          { id: "COFFEE1", fullName: "Free Coffee", rarity: "common" },
          { id: "XPBOOST", fullName: "Bonus XP", rarity: "uncommon" },
          { id: "TRYAGAIN", fullName: "Try Again", rarity: "common" },
          { id: "PRZ005", fullName: "₹5", rarity: "common" },
          { id: "JACKPOT", fullName: "Jackpot!", rarity: "legendary" },
        ];
        resolve({ ok: true });
      }, randDelay());
    }),
};
