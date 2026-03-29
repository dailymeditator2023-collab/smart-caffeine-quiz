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
