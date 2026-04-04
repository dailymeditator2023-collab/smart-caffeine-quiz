import { wrapInLayout, button, divider, trackUrl } from "./layout";
import { formatTime } from "@/lib/week";

const QUIZ_URL = "https://smartcaffeine-quiz.vercel.app";
const CAMPAIGN = "score_recap";

interface ScoreRecapData {
  userName: string;
  topic: string;
  topicEmoji: string;
  score: number;
  timeSeconds: number;
  badges: string[];
  rank: number;
  weekNumber: number;
}

export function buildScoreRecapEmail(data: ScoreRecapData): { subject: string; html: string } {
  const { userName, topic, topicEmoji, score, timeSeconds, badges, rank, weekNumber } = data;

  const scoreColor = score >= 8 ? "#34d399" : score >= 5 ? "#ffe14d" : "#ff3a6e";
  const firstName = userName.split(" ")[0];

  const leaderboardUrl = trackUrl(`${QUIZ_URL}/leaderboard?topic=${encodeURIComponent(topic)}`, CAMPAIGN, "leaderboard");
  const playUrl = trackUrl(QUIZ_URL, CAMPAIGN, "play_another");

  const badgeHtml = badges.length > 0
    ? `<div style="margin-top:16px;">
        <p style="color:#9ca3af; font-size:13px; margin:0 0 8px;">Badges earned:</p>
        ${badges.map(b => `<span style="display:inline-block; background-color:#1e1e1e; border:1px solid #333; color:#ffe14d; font-size:13px; padding:4px 12px; border-radius:20px; margin:2px 4px;">${b}</span>`).join("")}
      </div>`
    : "";

  const bodyHtml = `
    <p style="color:#f5f5f5; font-size:16px; margin:0 0 24px;">
      Hey ${firstName}! Here's how you did on this week's quiz:
    </p>

    <!-- Score card -->
    <div style="text-align:center; background-color:#121212; border-radius:12px; padding:24px; margin-bottom:24px;">
      <p style="color:#9ca3af; font-size:13px; margin:0 0 4px;">
        ${topicEmoji} ${topic} &middot; Week ${weekNumber}
      </p>
      <p style="font-size:48px; font-weight:800; color:${scoreColor}; margin:8px 0;">
        ${score}/10
      </p>
      <p style="color:#9ca3af; font-size:14px; margin:0;">
        ⏱️ ${formatTime(timeSeconds)} &nbsp;&middot;&nbsp; 🏆 Rank #${rank}
      </p>
      ${badgeHtml}
    </div>

    ${divider()}

    <!-- CTAs -->
    <div style="text-align:center;">
      <p style="color:#9ca3af; font-size:14px; margin:0 0 16px;">
        ${score >= 8 ? "Amazing score! See where you stand:" : score >= 5 ? "Nice work! Check the leaderboard:" : "Keep trying! See how others did:"}
      </p>
      ${button("View Leaderboard", leaderboardUrl)}
      <br><br>
      ${button("Play Another Topic", playUrl, "#333")}
    </div>
  `;

  const subject = `You scored ${score}/10 on ${topic}! ${topicEmoji}`;

  return {
    subject,
    html: wrapInLayout({ title: subject, bodyHtml, campaign: CAMPAIGN }),
  };
}
