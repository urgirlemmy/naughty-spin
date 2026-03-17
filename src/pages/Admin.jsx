import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { adminApi, prizesApi } from "../utils/api";
import { pageEnter } from "../utils/animations";
import PageLayout from "../components/layout/PageLayout";
import AdminDashboard from "../components/AdminDashboard";
import UserTable from "../components/UserTable";
import RewardList from "../components/RewardList";
import RewardTable from "../components/RewardTable";
import { useToast } from "../context/ToastContext";

const TABS = ["Overview", "Users", "Prizes"];

export default function Admin() {
  const navigate              = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [users, setUsers]     = useState([]);
  const [prizes, setPrizes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [usersRes, prizesRes] = await Promise.all([
      adminApi.users(),
      prizesApi.listAll(),
    ]);
    if (usersRes.ok)  setUsers(usersRes.data.users);
    else              addToast('Failed to load users.', 'error');
    if (prizesRes.ok) setPrizes(prizesRes.data.prizes);
    else              addToast('Failed to load prizes.', 'error');
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <PageLayout>
      <motion.div
        variants={pageEnter} initial="hidden" animate="visible"
        className="w-full max-w-4xl flex flex-col gap-6 mt-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1
            className="font-display tracking-widest text-5xl"
            style={{
              background: "linear-gradient(90deg, #9D4EDD, #00F5FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ADMIN PANEL
          </h1>
          <div className="flex gap-2">
            <motion.button
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: "rgba(0,245,255,0.08)",
                border: "1px solid rgba(0,245,255,0.3)",
                color: "var(--neon-cyan)",
              }}
            >
              ← Game
            </motion.button>
            <motion.button
              onClick={loadData}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: "rgba(157,78,221,0.1)",
                border: "1px solid rgba(157,78,221,0.3)",
                color: "var(--neon-violet)",
              }}
            >
              ↻ Refresh
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: "rgba(157,78,221,0.08)", border: "1px solid rgba(157,78,221,0.2)" }}
        >
          {TABS.map(tab => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all"
              style={{
                background: activeTab === tab ? "rgba(157,78,221,0.3)" : "transparent",
                color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                border: activeTab === tab ? "1px solid rgba(157,78,221,0.5)" : "1px solid transparent",
                boxShadow: activeTab === tab ? "0 0 14px rgba(157,78,221,0.2)" : "none",
              }}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="text-4xl"
              style={{ filter: "drop-shadow(0 0 12px rgba(157,78,221,0.8))" }}
            >⚙️</motion.div>
          </div>
        ) : (
          <>
            {activeTab === "Overview" && (
              <motion.div key="overview" variants={pageEnter} initial="hidden" animate="visible"
                className="flex flex-col gap-6"
              >
                <AdminDashboard users={users} prizes={prizes} />
                <div className="grid grid-cols-2 gap-6">
                  <RewardList prizes={prizes} />
                  <UserTable users={users} onUsersChange={loadData} />
                </div>
              </motion.div>
            )}
            {activeTab === "Users" && (
              <motion.div key="users" variants={pageEnter} initial="hidden" animate="visible">
                <UserTable users={users} onUsersChange={loadData} />
              </motion.div>
            )}
            {activeTab === "Prizes" && (
              <motion.div key="prizes" variants={pageEnter} initial="hidden" animate="visible"
                className="flex flex-col gap-6"
              >
                <RewardTable prizes={prizes} onPrizesChange={loadData} />
                <RewardList prizes={prizes} />
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </PageLayout>
  );
}