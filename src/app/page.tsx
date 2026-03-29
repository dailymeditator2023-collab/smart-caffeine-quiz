"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import StreakBar from "@/components/StreakBar";
import TopicCard from "@/components/TopicCard";
import { TOPICS, type Topic } from "@/lib/topics";
import { getWeekNumber } from "@/lib/week";

interface PlayedTopic {
  topic: string;
  score: number;
}

// ---------- REGISTRATION (shown to new visitors) ----------

function RegistrationView() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExisting, setShowExisting] = useState(false);
  const [existingUser, setExistingUser] = useState<{ name: string; email: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShowExisting(false);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("All fields are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "").slice(-10);
    if (phoneDigits.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setExistingUser(data.user);
        setShowExisting(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("bb_email", data.user.email);
      localStorage.setItem("bb_name", data.user.name);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  function handleContinueAsExisting() {
    if (!existingUser) return;
    localStorage.setItem("bb_email", existingUser.email);
    localStorage.setItem("bb_name", existingUser.name);
    window.location.reload();
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full animate-fade-in">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-orange/10 mb-4">
            <span className="text-3xl">☕</span>
          </div>
          <h1
            className="text-3xl font-bold text-brand-orange mb-1"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            How Smart Are You?
          </h1>
          <p className="text-text-secondary text-sm">
            by Smart Caffeine · Weekly Quiz Challenge
          </p>
        </div>

        {/* What you get */}
        <div className="bg-bg-card rounded-xl p-4 mb-6 border border-white/5">
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <span className="text-2xl block mb-1">🧠</span>
              <span className="text-text-secondary">6 Topics</span>
            </div>
            <div>
              <span className="text-2xl block mb-1">⏱</span>
              <span className="text-text-secondary">Timed Quiz</span>
            </div>
            <div>
              <span className="text-2xl block mb-1">🏆</span>
              <span className="text-text-secondary">Leaderboard</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-neon-pink/10 border border-neon-pink/30 rounded-xl p-3 mb-6 flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <p className="text-xs text-neon-pink font-medium">
            One attempt per topic per week — no retries! Your first score is final.
          </p>
        </div>

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-brand-orange/50 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-brand-orange/50 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit number"
              className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-brand-orange/50 transition"
            />
          </div>

          {error && <p className="text-neon-pink text-sm">{error}</p>}

          {showExisting && existingUser && (
            <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-xl p-4 animate-fade-in">
              <p className="text-neon-blue text-sm font-medium mb-3">
                This email is already registered as {existingUser.name}.
              </p>
              <button
                type="button"
                onClick={handleContinueAsExisting}
                className="w-full py-2.5 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue rounded-lg font-medium hover:bg-neon-blue/30 transition"
              >
                Continue as {existingUser.name} →
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-orange text-bg-dark font-bold text-lg rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
          >
            {loading ? "Creating account..." : "Start the Quiz →"}
          </button>
        </form>

        <p className="text-center text-text-secondary/50 text-xs mt-6">
          Your email is your identity. No password needed.
        </p>
      </div>
    </main>
  );
}

// ---------- TOPICS (shown to returning users) ----------

function TopicsView({ user }: { user: { email: string; name: string } }) {
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
          const weeks = [...new Set((data.attempts || []).map((a: { week_number: number }) => a.week_number))] as number[];
          setWeeksPlayed(weeks);
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

          {!loading && (
            <StreakBar
              currentStreak={streak}
              currentWeek={weekNumber}
              weeksPlayed={weeksPlayed}
            />
          )}

          <div className="bg-neon-pink/10 border border-neon-pink/30 rounded-xl p-3 mb-6 flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <p className="text-sm text-neon-pink font-medium">
              One attempt per topic — no retries! Your first score is final.
            </p>
          </div>

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
                You&apos;ve played all {TOPICS.length} topics. See you next Monday!
              </p>
              <button
                onClick={() => router.push("/leaderboard")}
                className="mt-6 px-6 py-3 bg-neon-blue/20 border border-neon-blue/50 text-neon-blue rounded-xl font-medium hover:bg-neon-blue/30 transition"
              >
                View Leaderboard →
              </button>
            </div>
          )}

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

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-bg-card/50 animate-pulse" />
              ))}
            </div>
          )}

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

// ---------- MAIN PAGE ----------

export default function HomePage() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("bb_email");
    const name = localStorage.getItem("bb_name");
    if (email && name) {
      setUser({ email, name });
    }
    setChecking(false);
  }, []);

  // Listen for storage changes (when registration completes via router.refresh)
  useEffect(() => {
    function checkUser() {
      const email = localStorage.getItem("bb_email");
      const name = localStorage.getItem("bb_name");
      if (email && name) {
        setUser({ email, name });
      }
    }

    window.addEventListener("storage", checkUser);
    // Also re-check on focus (covers router.refresh)
    window.addEventListener("focus", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("focus", checkUser);
    };
  }, []);

  if (checking) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <RegistrationView />;
  }

  return <TopicsView user={user} />;
}
