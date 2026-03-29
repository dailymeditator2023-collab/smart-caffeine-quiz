interface ProgressPipsProps {
  total: number;
  current: number; // 0-indexed current question
  answers: number[]; // array of selected indices (-1 = timed out, -2 = not yet answered)
}

export default function ProgressPips({ total, current, answers }: ProgressPipsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const isCurrentQ = i === current;
        const hasAnswered = i < answers.length;
        const timedOut = hasAnswered && answers[i] === -1;

        let classes = "w-3 h-3 rounded-full transition-all duration-300 ";

        if (isCurrentQ) {
          classes += "bg-neon-blue ring-2 ring-neon-blue/50 scale-125";
        } else if (timedOut) {
          classes += "bg-neon-pink/60";
        } else if (hasAnswered) {
          classes += "bg-neon-blue/60";
        } else {
          classes += "bg-white/10";
        }

        return <div key={i} className={classes} />;
      })}
    </div>
  );
}
