import { formatTime } from "@/lib/week";
import { getTopicByDbName } from "@/lib/topics";

interface Champion {
  week_number: number;
  topic: string;
  user_name: string;
  score: number;
  time_seconds: number;
}

interface HallOfFameProps {
  champions: Champion[];
}

export default function HallOfFame({ champions }: HallOfFameProps) {
  if (champions.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <p className="text-3xl mb-2">🏛️</p>
        <p>Hall of Fame will appear after Week 1 ends.</p>
      </div>
    );
  }

  // Group by week
  const byWeek = new Map<number, Champion[]>();
  for (const c of champions) {
    const arr = byWeek.get(c.week_number) || [];
    arr.push(c);
    byWeek.set(c.week_number, arr);
  }

  return (
    <div className="space-y-6">
      {[...byWeek.entries()].map(([week, champs]) => (
        <div key={week}>
          <h4 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
            Week {week} Champions
          </h4>
          <div className="space-y-2">
            {champs.map((c, i) => {
              const topicInfo = getTopicByDbName(c.topic);
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neon-yellow/5 border border-neon-yellow/20"
                >
                  <span className="text-lg">🏆</span>
                  <div className="flex-1">
                    <span className="font-medium text-text-primary">{c.user_name}</span>
                    <span className="text-xs text-text-secondary ml-2">
                      {topicInfo?.emoji} {c.topic}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-neon-yellow">{c.score}/10</div>
                    <div className="text-xs text-text-secondary">{formatTime(c.time_seconds)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
