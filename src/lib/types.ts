// ---- Database row types ----

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  streak: number;
  last_played_week: number;
  created_at: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  email: string;
  topic: string;
  week_number: number;
  score: number;
  time_seconds: number;
  badges: string[];
  answers_breakdown: AnswerBreakdown[];
  created_at: string;
}

export interface AnswerBreakdown {
  question_id: string;
  selected: number; // -1 if timed out
  correct_index: number;
  is_correct: boolean;
}

export interface QuestionRow {
  id: string;
  topic: string;
  question: string;
  options: string[]; // 4 options
  correct_index: number;
  week_number: number | null;
  active: boolean;
}

// Question sent to the client (no correct_index!)
export interface ClientQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
}

export interface HallOfFameEntry {
  id: string;
  week_number: number;
  topic: string;
  user_name: string;
  score: number;
  time_seconds: number;
}

// ---- API response types ----

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  time_seconds: number;
  badges: string[];
  isYou: boolean;
}

export interface SubmitResult {
  score: number;
  time_seconds: number;
  badges: string[];
  answers_breakdown: AnswerBreakdown[];
  rank: number;
}

export interface ProfileData {
  user: User;
  attempts: Attempt[];
  topics_played_this_week: string[];
  best_scores: Record<string, { score: number; time_seconds: number; week_number: number }>;
}

// ---- Badge names (constants) ----

export const BADGE_NAMES = {
  PERFECT_BRAIN: "Perfect Brain 🧠",
  BIG_BRAIN: "Big Brain 🔥",
  SPEED_DEMON: "Speed Demon ⚡",
  STREAK: "Streak", // will be prefixed with number, e.g. "3 Week Streak 🔥"
  PERSONAL_BEST: "New Personal Best 📈",
} as const;
