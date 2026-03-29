"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import UserGuard from "@/components/UserGuard";
import { formatTime, getWeekNumber } from "@/lib/week";
import { getTopicByDbName, TOPICS } from "@/lib/topics";

interface ProfileData {
  user: {
    name: string;
    email: string;
    streak: number;
    created_at: string;
  };
  total_weeks_played: number;
  topics_played_this_week: string[];
  best_scores: Record<string, { score: number; time_seconds: number; week_number: number }>;
}

function ProfileContent({ user }: { user: { email: string; name: string } }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const weekNumber = getWeekNumber();

  useEffect(() => {
    fetch(`/api/profile?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.email]);

  function handleLogout() {
    localStorage.removeItem("bb_email");
    localStorage.removeItem("bb_name");
    router.push("/register");
  }

  if (loading) {
    return (
      <div className="max-w-lg w-full">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-card/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile?.user) {
    return (
      <div className="text-center py-20">
        <p className="text-neon-pink">Profile not found</p>
        <button onClick={handleLogout} className="mt-4 text-brand-orange underline">
          Re-register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-text-primary"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            {profile.user.name}
          </h1>
          <p className="text-text-secondary text-sm">{profile.user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-text-secondary hover:text-neon-pink transition px-3 py-1.5 border border-white/10 rounded-lg"
        >
          Switch account
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-bg-card rounded-xl p-4 border border-white/5 text-center">
          <div className="text-2xl font-bold text-neon-yellow">
            {profile.user.streak > 0 ? `🔥 ${profile.user.streak}` : "0"}
          </div>
          <div className="text-xs text-text-secondary mt-1">Week Streak</div>
        </div>
        <div className="bg-bg-card rounded-xl p-4 border border-white/5 text-center">
          <div className="text-2xl font-bold text-neon-blue">{profile.total_weeks_played}</div>
          <div className="text-xs text-text-secondary mt-1">Weeks Played</div>
        </div>
        <div className="bg-bg-card rounded-xl p-4 border border-white/5 text-center">
          <div className="text-2xl font-bold text-brand-orange">
            {profile.topics_played_this_week.length}/5
          </div>
          <div className="text-xs text-text-secondary mt-1">This Week</div>
        </div>
      </div>

      {/* Per-topic best scores */}
      <h2
        className="text-lg font-bold text-text-primary mb-3"
        style={{ fontFamily: "var(--font-bricolage)" }}
      >
        Best Scores
      </h2>
      <div className="space-y-2 mb-8">
        {TOPICS.map((t) => {
          const best = profile.best_scores[t.dbName];
          const playedThisWeek = profile.topics_played_this_week.includes(t.dbName);

          return (
            <div
              key={t.slug}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-white/5"
            >
              <span className="text-xl">{t.emoji}</span>
              <div className="flex-1">
                <span className="font-medium text-text-primary text-sm">{t.name}</span>
                {playedThisWeek && (
                  <span className="text-xs text-neon-green ml-2">✓ Week {weekNumber}</span>
                )}
              </div>
              {best ? (
                <div className="text-right">
                  <div className="font-bold text-neon-green text-sm">{best.score}/10</div>
                  <div className="text-xs text-text-secondary">{formatTime(best.time_seconds)}</div>
                </div>
              ) : (
                <span className="text-xs text-text-secondary">Not played</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Member since */}
      <p className="text-center text-text-secondary/50 text-xs">
        Member since {new Date(profile.user.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <>
      <NavBar />
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <UserGuard>{(user) => <ProfileContent user={user} />}</UserGuard>
      </main>
    </>
  );
}
