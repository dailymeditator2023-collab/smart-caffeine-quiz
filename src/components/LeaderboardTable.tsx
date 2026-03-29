import { formatTime } from "@/lib/week";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  time_seconds: number;
  badges: string[];
  topic?: string;
  quizCount?: number;
  isYou: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  showTopic?: boolean;
  showQuizCount?: boolean;
}

export default function LeaderboardTable({ entries, showTopic = false, showQuizCount = false }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p className="text-4xl mb-3">🏜️</p>
        <p>No entries yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={`${entry.rank}-${entry.name}`}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
            entry.isYou
              ? "bg-neon-green/10 border border-neon-green/30"
              : "bg-bg-card/50 border border-white/5"
          }`}
        >
          {/* Rank */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              entry.rank === 1
                ? "bg-neon-yellow/20 text-neon-yellow"
                : entry.rank === 2
                ? "bg-white/10 text-white"
                : entry.rank === 3
                ? "bg-orange-500/20 text-orange-400"
                : "bg-white/5 text-text-secondary"
            }`}
          >
            {entry.rank <= 3
              ? ["🥇", "🥈", "🥉"][entry.rank - 1]
              : entry.rank}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-primary truncate">
                {entry.name}
              </span>
              {entry.isYou && (
                <span className="text-xs bg-neon-green/20 text-neon-green px-1.5 py-0.5 rounded font-medium">
                  you
                </span>
              )}
            </div>
            {showTopic && entry.topic && (
              <span className="text-xs text-text-secondary">{entry.topic}</span>
            )}
            {showQuizCount && entry.quizCount && (
              <span className="text-xs text-text-secondary">{entry.quizCount} quizzes played</span>
            )}
          </div>

          {/* Score + Time */}
          <div className="text-right">
            <div className="font-bold text-neon-green">
              {showQuizCount ? entry.score : `${entry.score}/10`}
            </div>
            <div className="text-xs text-text-secondary">
              {showQuizCount ? "total pts" : formatTime(entry.time_seconds)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
