"use client";

interface StreakBarProps {
  currentStreak: number;
  currentWeek: number;
  weeksPlayed: number[]; // array of week numbers the user has played
}

export default function StreakBar({ currentStreak, currentWeek, weeksPlayed }: StreakBarProps) {
  // Show last 4 weeks (including current)
  const weeks = [];
  for (let i = 3; i >= 0; i--) {
    const weekNum = currentWeek - i;
    if (weekNum < 1) continue;
    weeks.push({
      number: weekNum,
      played: weeksPlayed.includes(weekNum),
      isCurrent: weekNum === currentWeek,
    });
  }

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-1.5">
        {weeks.map((w) => (
          <div key={w.number} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                w.played
                  ? "bg-neon-green text-bg-dark"
                  : w.isCurrent
                  ? "border-2 border-brand-orange/50 text-brand-orange bg-transparent"
                  : "bg-white/5 text-text-secondary"
              }`}
            >
              {w.played ? "✓" : `W${w.number}`}
            </div>
          </div>
        ))}
      </div>
      {currentStreak > 0 && (
        <span className="text-sm font-medium text-neon-yellow ml-auto">
          🔥 {currentStreak} week streak
        </span>
      )}
    </div>
  );
}
