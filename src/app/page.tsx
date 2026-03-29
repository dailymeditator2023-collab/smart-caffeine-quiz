"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import UserGuard from "@/components/UserGuard";
import StreakBar from "@/components/StreakBar";
import TopicCard from "@/components/TopicCard";
import { TOPICS, type Topic } from "@/lib/topics";
import { getWeekNumber } from "@/lib/week";

interface PlayedTopic {
  topic: string;
  score: number;
}

function HomeContent({ user }: { user: { email: string; name: string } }) {
  const router = useRouter();
  const [playedTopics, setPlayedTopics] = useState<PlayedTopic[]>([]);
  const [streak, setStreak] = useState(0);
  const [weeksPlayed, setWeeksPlayed] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const weekNumber = getWeekNumber();

  useEffect(() => {
    fetch(`/api/profile?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setStreak(data.user.streak || 0);
          // Get unique weeks played
          const weeks = [...new Set((data.attempts || []).map((a: { week_number: number }) => a.week_number))] as number[];
          setWeeksPlayed(weeks);
          // Get topics played this week
          const thisWeek = (data.attempts || [])
            .filter((a: { week_number: number }) => a.week_number === weekNumber)
            .map((a: { topic: string; score: number }) => ({ topic: a.topic, score: a.score }));
          setPlayedTopics(thisWeek);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.email, weekNumber]);

  function handleSelectTopic(topic: Topic) {
    router.push(`/quiz?topic=${encodeURIComponent(topic.slug)}`);
  }

  const allPlayed = playedTopics.length >= TOPICS.length;

  return (
    <>
      <NavBar />
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="max-w-lg w-full animate-fade-in">
          {/* Welcome */}
          <div className="mb-6">
            <h1
              className="text-2xl font-bold text-text-primary"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              Hey {user.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Week {weekNumber} · Pick a topic and test your knowledge
            </p>
          </div>

          {/* Streak */}
          {!loading && (
            <StreakBar
              currentStreak={streak}
              currentWeek={weekNumber}
              weeksPlayed={weeksPlayed}
            />
          )}

          {/* Warning banner */}
          <div className="bg-neon-pink/10 border border-neon-pink/30 rounded-xl p-3 mb-6 flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <p className="text-sm text-neon-pink font-medium">
              One attempt per topic — no retries! Your first score is final.
            </p>
          </div>

          {/* All played state */}
          {!loading && allPlayed && (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-5xl mb-4">🎉</div>
              <h2
                className="text-2xl font-bold text-text-primary mb-2"
                style={{ fontFamily: "var(--font-bricolage)" }}
              >
                All done this week!
              </h2>
              <p className="text-text-secondary">
                You&apos;ve played all 6 topics. See you next Monday!
              </p>
              <button
                onClick={() => router.push("/leaderboard")}
                className="mt-6 px-6 py-3 bg-neon-blue/20 border border-neon-blue/50 text-neon-blue rounded-xl font-medium hover:bg-neon-blue/30 transition"
              >
                View Leaderboard →
              </button>
            </div>
          )}

          {/* Topic cards */}
          {!loading && !allPlayed && (
            <div className="space-y-3">
              {TOPICS.map((topic) => {
                const played = playedTopics.find((p) => p.topic === topic.dbName);
                return (
                  <TopicCard
                    key={topic.slug}
                    topic={topic}
                    played={!!played}
                    score={played?.score}
                    onSelect={handleSelectTopic}
                  />
                );
              })}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-bg-card/50 animate-pulse" />
              ))}
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-text-secondary text-xs mt-8">
            Powered by{" "}
            <a
              href="https://getsmartcaffeine.com"
              className="text-brand-orange/60 hover:text-brand-orange transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Smart Caffeine
            </a>
          </p>
        </div>
      </main>
    </>
  );
}

export default function HomePage() {
  return <UserGuard>{(user) => <HomeContent user={user} />}</UserGuard>;
}
