const LAUNCH_DATE = new Date("2026-03-29T00:00:00+05:30"); // IST launch
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export function getWeekNumber(date: Date = new Date()): number {
  const diff = date.getTime() - LAUNCH_DATE.getTime();
  return Math.max(1, Math.floor(diff / MS_PER_WEEK) + 1);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Get the month label (e.g. "April 2026") for a given date */
export function getMonthLabel(date: Date = new Date()): string {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

/** Get the start and end week numbers for the current month */
export function getMonthWeekRange(date: Date = new Date()): { startWeek: number; endWeek: number; monthLabel: string } {
  const year = date.getFullYear();
  const month = date.getMonth();

  // First day of current month
  const firstDay = new Date(year, month, 1);
  // Last day of current month
  const lastDay = new Date(year, month + 1, 0);

  const startWeek = getWeekNumber(firstDay);
  const endWeek = getWeekNumber(lastDay);

  return {
    startWeek,
    endWeek,
    monthLabel: getMonthLabel(date),
  };
}

/** Bonus points per week played (for monthly leaderboard) */
export const WEEKLY_PLAY_BONUS = 5;

/** Monthly prize amount */
export const MONTHLY_PRIZE = 5000;
