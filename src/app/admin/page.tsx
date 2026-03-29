"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/week";

interface AdminData {
  currentWeek: number;
  overview: {
    totalUsers: number;
    totalAttempts: number;
    weekAttempts: number;
    avgScore: number;
    avgTopicsPerUser: number;
  };
  registrationsByDay: Record<string, number>;
  attemptsByDay: Record<string, number>;
  avgScoreByTopic: { topic: string; avgScore: number; totalPlays: number }[];
  uniqueUsersByWeek: { week: number; users: number; attempts: number }[];
  streakDist: Record<string, number>;
  badgeCounts: Record<string, number>;
  recentUsers: { name: string; email: string; phone: string; streak: number; created_at: string }[];
  recentAttempts: { email: string; topic: string; score: number; time_seconds: number; week_number: number; created_at: string }[];
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#1e1e1e] rounded-xl p-4 border border-white/5">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-[#9ca3af] mt-1">{label}</div>
      {sub && <div className="text-xs text-[#ff6633] mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#ff6633] border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <p className="text-red-400">Failed to load admin data</p>
      </main>
    );
  }

  const sortedRegDays = Object.entries(data.registrationsByDay).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14);
  const sortedAttemptDays = Object.entries(data.attemptsByDay).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14);

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "system-ui" }}>
              📊 Admin Dashboard
            </h1>
            <p className="text-[#9ca3af] text-sm mt-1">
              Smart Caffeine Quiz · Week {data.currentWeek}
            </p>
          </div>
          <a
            href="/"
            className="text-sm text-[#ff6633] hover:underline"
          >
            ← Back to Quiz
          </a>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard label="Total Users" value={data.overview.totalUsers} />
          <StatCard label="Total Quizzes" value={data.overview.totalAttempts} />
          <StatCard label="This Week" value={data.overview.weekAttempts} sub="quizzes played" />
          <StatCard label="Avg Score" value={`${data.overview.avgScore}/10`} />
          <StatCard label="Avg Topics/User" value={data.overview.avgTopicsPerUser} sub="this week" />
        </div>

        {/* Two column layout */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Registrations per day */}
          <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5">
            <h2 className="font-bold text-white mb-3">📈 Registrations (Last 14 days)</h2>
            {sortedRegDays.length === 0 ? (
              <p className="text-[#9ca3af] text-sm">No registrations yet</p>
            ) : (
              <div className="space-y-1.5">
                {sortedRegDays.map(([day, count]) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-xs text-[#9ca3af] w-20">{day.slice(5)}</span>
                    <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ff6633] rounded-full"
                        style={{ width: `${Math.min(100, (count / Math.max(...sortedRegDays.map(([, c]) => c))) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quizzes per day */}
          <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5">
            <h2 className="font-bold text-white mb-3">🎯 Quizzes Played (Last 14 days)</h2>
            {sortedAttemptDays.length === 0 ? (
              <p className="text-[#9ca3af] text-sm">No quizzes yet</p>
            ) : (
              <div className="space-y-1.5">
                {sortedAttemptDays.map(([day, count]) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-xs text-[#9ca3af] w-20">{day.slice(5)}</span>
                    <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4d8dff] rounded-full"
                        style={{ width: `${Math.min(100, (count / Math.max(...sortedAttemptDays.map(([, c]) => c))) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Score by Topic */}
          <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5">
            <h2 className="font-bold text-white mb-3">🏆 Performance by Topic</h2>
            <div className="space-y-3">
              {data.avgScoreByTopic.map((t) => (
                <div key={t.topic} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white">{t.topic}</span>
                    <span className="text-xs text-[#9ca3af] ml-2">({t.totalPlays} plays)</span>
                  </div>
                  <span className="font-bold text-[#34d399]">{t.avgScore}/10</span>
                </div>
              ))}
              {data.avgScoreByTopic.length === 0 && (
                <p className="text-[#9ca3af] text-sm">No data yet</p>
              )}
            </div>
          </div>

          {/* Week over Week */}
          <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5">
            <h2 className="font-bold text-white mb-3">📅 Week over Week</h2>
            <div className="space-y-2">
              {data.uniqueUsersByWeek.map((w) => (
                <div key={w.week} className="flex items-center justify-between text-sm">
                  <span className="text-[#9ca3af]">Week {w.week}</span>
                  <div className="flex gap-4">
                    <span className="text-white">{w.users} users</span>
                    <span className="text-[#4d8dff]">{w.attempts} quizzes</span>
                  </div>
                </div>
              ))}
              {data.uniqueUsersByWeek.length === 0 && (
                <p className="text-[#9ca3af] text-sm">No data yet</p>
              )}
            </div>
          </div>

          {/* Streak Distribution */}
          <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5">
            <h2 className="font-bold text-white mb-3">🔥 Streak Distribution</h2>
            <div className="space-y-2">
              {Object.entries(data.streakDist)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([streak, count]) => (
                  <div key={streak} className="flex items-center justify-between text-sm">
                    <span className="text-[#9ca3af]">
                      {parseInt(streak) === 0 ? "No streak" : `${streak} week streak`}
                    </span>
                    <span className="font-bold text-[#ffe14d]">{count} users</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Badge Distribution */}
          <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5">
            <h2 className="font-bold text-white mb-3">🏅 Badges Earned</h2>
            <div className="space-y-2">
              {Object.entries(data.badgeCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([badge, count]) => (
                  <div key={badge} className="flex items-center justify-between text-sm">
                    <span className="text-white">{badge}</span>
                    <span className="font-bold text-[#ffe14d]">{count}×</span>
                  </div>
                ))}
              {Object.keys(data.badgeCounts).length === 0 && (
                <p className="text-[#9ca3af] text-sm">No badges earned yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5 mt-6">
          <h2 className="font-bold text-white mb-3">👤 Recent Registrations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#9ca3af] text-left border-b border-white/5">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Phone</th>
                  <th className="pb-2">Streak</th>
                  <th className="pb-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 text-white">{u.name}</td>
                    <td className="py-2 text-[#9ca3af]">{u.email}</td>
                    <td className="py-2 text-[#9ca3af]">{u.phone}</td>
                    <td className="py-2 text-[#ffe14d]">{u.streak > 0 ? `🔥 ${u.streak}` : "—"}</td>
                    <td className="py-2 text-[#9ca3af]">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5 mt-6">
          <h2 className="font-bold text-white mb-3">🎮 Recent Quizzes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#9ca3af] text-left border-b border-white/5">
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Topic</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Week</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAttempts.map((a, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 text-[#9ca3af]">{a.email}</td>
                    <td className="py-2 text-white">{a.topic}</td>
                    <td className={`py-2 font-bold ${a.score >= 8 ? "text-[#34d399]" : a.score >= 5 ? "text-[#ffe14d]" : "text-[#ff3a6e]"}`}>
                      {a.score}/10
                    </td>
                    <td className="py-2 text-[#9ca3af]">{formatTime(a.time_seconds)}</td>
                    <td className="py-2 text-[#9ca3af]">W{a.week_number}</td>
                    <td className="py-2 text-[#9ca3af]">{new Date(a.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-[#9ca3af]/50 text-xs mt-8 pb-8">
          Admin Dashboard · Smart Caffeine Quiz
        </p>
      </div>
    </main>
  );
}
