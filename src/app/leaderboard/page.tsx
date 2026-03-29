"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NavBar from "@/components/NavBar";
import TopicTabs from "@/components/TopicTabs";
import LeaderboardTable from "@/components/LeaderboardTable";
import HallOfFame from "@/components/HallOfFame";
import { getWeekNumber } from "@/lib/week";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  time_seconds: number;
  badges: string[];
  topic: string;
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

  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const weekNumber = getWeekNumber();

  const email = typeof window !== "undefined" ? localStorage.getItem("bb_email") || "" : "";

  useEffect(() => {
    setLoading(true);
    const topicParam = selectedTopic === "All" ? "" : `&topic=${encodeURIComponent(selectedTopic)}`;
    fetch(`/api/leaderboard?week=${weekNumber}${topicParam}&email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.leaderboard || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedTopic, weekNumber, email]);

  // Load hall of fame once
  useEffect(() => {
    fetch("/api/hall-of-fame")
      .then((r) => r.json())
      .then((data) => setChampions(data.champions || []))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-lg w-full animate-fade-in">
      <h1
        className="text-2xl font-bold text-text-primary mb-1"
        style={{ fontFamily: "var(--font-bricolage)" }}
      >
        🏆 Leaderboard
      </h1>
      <p className="text-text-secondary text-sm mb-4">Week {weekNumber}</p>

      {/* Topic tabs */}
      <div className="mb-6">
        <TopicTabs selected={selectedTopic} onSelect={setSelectedTopic} />
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-bg-card/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <LeaderboardTable entries={entries} showTopic={selectedTopic === "All"} />
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
