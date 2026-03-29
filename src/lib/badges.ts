/**
 * Server-side badge calculation.
 * Called after scoring a quiz submission.
 */
export function calculateBadges(params: {
  score: number;
  timeSeconds: number;
  streak: number; // user's streak AFTER this play
  previousBest: number | null; // previous best score for this topic, or null if first attempt
}): string[] {
  const badges: string[] = [];
  const { score, timeSeconds, streak, previousBest } = params;

  // Perfect Brain: 10/10
  if (score === 10) {
    badges.push("Perfect Brain 🧠");
  }

  // Big Brain: 8+ (but not if already got Perfect Brain — avoid redundancy)
  if (score >= 8 && score < 10) {
    badges.push("Big Brain 🔥");
  }

  // Speed Demon: 6+ score in under 50 seconds total
  if (score >= 6 && timeSeconds < 50) {
    badges.push("Speed Demon ⚡");
  }

  // X Week Streak: 3+ consecutive weeks
  if (streak >= 3) {
    badges.push(`${streak} Week Streak 🔥`);
  }

  // New Personal Best: beat previous best on this topic
  if (previousBest !== null && score > previousBest) {
    badges.push("New Personal Best 📈");
  }

  return badges;
}
