interface BadgeDisplayProps {
  badges: string[];
}

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {badges.map((badge, i) => (
        <span
          key={i}
          className="px-3 py-1.5 rounded-full bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow text-sm font-medium animate-pop-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {badge}
        </span>
      ))}
    </div>
  );
}
