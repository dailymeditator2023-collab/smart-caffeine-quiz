"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NavBar from "@/components/NavBar";
import TopicTabs from "@/components/TopicTabs";
import LeaderboardTable from "@/components/LeaderboardTable";
import HallOfFame from "@/components/HallOfFame";
import { getWeekNumber, MONTHLY_PRIZE } from "@/lib/week";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  time_seconds: number;
  badges: string[];
  topic: string;
  quizCount?: number;
  weeksPlayed?: number;
  isYou: boolean;
}

interface Champion {
  week_number: number;
  topic: string;
  user_name: string;
  score: number;
  time_seconds: number;
}

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "All";

  const [mode, setMode] = useState<"weekly" | "monthly" | "alltime">("weekly");
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [monthLabel, setMonthLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const weekNumber = getWeekNumber();

  const email = typeof window !== "undefined" ? localStorage.getItem("bb_email") || "" : "";

  useEffect(() => {
    setLoading(true);
    const topicParam = mode === "weekly" && selectedTopic !== "All"
      ? `&topic=${encodeURIComponent(selectedTopic)}`
      : "";
    fetch(`/api/leaderboard?week=${weekNumber}${topicParam}&email=${encodeURIComponent(email)}&mode=${mode}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.leaderboard || []);
        if (data.monthLabel) setMonthLabel(data.monthLabel);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedTopic, weekNumber, email, mode]);

  useEffect(() => {
    fetch("/api/hall-of-fame")
      .then((r) => r.json())
      .then((data) => setChampions(data.champions || []))
      .catch(console.error);
  }, []);

  const subtitle = mode === "weekly"
    ? `Week ${weekNumber}`
    : mode === "monthly"
    ? monthLabel || "This Month"
    : "All Time";

  return (
    <div className="max-w-lg w-full animate-fade-in">
      <h1
        className="text-2xl font-bold text-text-primary mb-1"
        style={{ fontFamily: "var(--font-bricolage)" }}
      >
        🏆 Leaderboard
      </h1>
      <p className="text-text-secondary text-sm mb-4">
        {subtitle}
      </p>

      {/* Weekly / Monthly / All-Time toggle */}
      <div className="flex bg-bg-card rounded-xl p-1 mb-4 border border-white/5">
        <button
          onClick={() => setMode("weekly")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "weekly"
              ? "bg-brand-orange text-bg-dark"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          📅 Week
        </button>
        <button
          onClick={() => setMode("monthly")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "monthly"
              ? "bg-brand-orange text-bg-dark"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          🏆 Month
        </button>
        <button
          onClick={() => setMode("alltime")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "alltime"
              ? "bg-brand-orange text-bg-dark"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          🌟 All Time
        </button>
      </div>

      {/* Monthly prize banner */}
      {mode === "monthly" && (
        <div className="bg-gradient-to-r from-neon-yellow/10 to-brand-orange/10 rounded-xl p-4 mb-4 border border-neon-yellow/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <p className="font-bold text-neon-yellow text-lg">
                Win ₹{MONTHLY_PRIZE.toLocaleString("en-IN")}!
              </p>
              <p className="text-text-secondary text-xs">
                #1 on the monthly leaderboard wins the cash prize.
                Points = Total Score + 5 bonus per week played.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Topic tabs — only for weekly */}
      {mode === "weekly" && (
        <div className="mb-6">
          <TopicTabs selected={selectedTopic} onSelect={setSelectedTopic} />
        </div>
      )}

      {/* Leaderboard */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-bg-card/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <LeaderboardTable
          entries={entries}
          showTopic={mode === "weekly" && selectedTopic === "All"}
          showQuizCount={mode === "alltime"}
          showMonthly={mode === "monthly"}
        />
      )}

      {/* Hall of Fame */}
      <div className="mt-12">
        <h2
          className="text-xl font-bold text-text-primary mb-4"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          🏛️ Hall of Fame
        </h2>
        <HallOfFame champions={champions} />
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <>
      <NavBar />
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" />
            </div>
          }
        >
          <LeaderboardContent />
        </Suspense>
      </main>
    </>
  );
}
