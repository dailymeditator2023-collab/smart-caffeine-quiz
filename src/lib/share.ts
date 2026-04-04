import { formatTime } from "./week";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://smartcaffeine.com/quiz";

export function getShareText(params: {
  score: number;
  timeSeconds: number;
  topic: string;
  weekNumber: number;
  streak: number;
}): string {
  const { score, timeSeconds, topic, weekNumber, streak } = params;
  const time = formatTime(timeSeconds);

  let text = `🧠 I scored ${score}/10 on Smart Caffeine Quiz — ${topic} (Week ${weekNumber}) in ${time}!\n`;
  text += `⚠️ One attempt only — no retries!\n`;

  if (streak >= 2) {
    text += `🔥 ${streak} week streak!\n`;
  }

  text += `⚡ Beat my score → ${APP_URL}\n\n`;
  text += `#SmartCaffeineQuiz #PlayAndWin`;

  return text;
}
