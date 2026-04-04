import { wrapInLayout, button, divider, trackUrl } from "./layout";
import { formatTime } from "@/lib/week";
import { TOPICS } from "@/lib/topics";

const QUIZ_URL = "https://smartcaffeine-quiz.vercel.app";
const CAMPAIGN = "weekly_summary";

interface TopicLeaderboard {
  topic: string;
  emoji: string;
  topFive: { rank: number; name: string; score: number; timeSeconds: number }[];
}

interface UserScore {
  topic: string;
  emoji: string;
  score: number;
  rank: number;
}

interface WeeklySummaryData {
  userName: string;
  newWeekNumber: number;
  topicLeaderboards: TopicLeaderboard[];
  userScores: UserScore[];
}

export function buildWeeklySummaryEmail(data: WeeklySummaryData): { subject: string; html: string } {
  const { userName, newWeekNumber, topicLeaderboards, userScores } = data;
  const firstName = userName.split(" ")[0];
  const lastWeek = newWeekNumber - 1;

  const playUrl = trackUrl(QUIZ_URL, CAMPAIGN, "play_now");
  const leaderboardUrl = trackUrl(`${QUIZ_URL}/leaderboard`, CAMPAIGN, "leaderboard");

  // Topic list for announcement
  const topicList = TOPICS.map(t => `${t.emoji} ${t.name}`).join("&nbsp;&nbsp;&middot;&nbsp;&nbsp;");

  // User's own scores section
  const userScoresHtml = userScores.length > 0
    ? `
      ${divider()}
      <p style="color:#f5f5f5; font-size:16px; font-weight:700; margin:0 0 12px;">
        📊 Your Week ${lastWeek} Scores
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        ${userScores.map(s => `
          <tr>
            <td style="padding:8px 0; color:#f5f5f5; font-size:14px;">
              ${s.emoji} ${s.topic}
            </td>
            <td style="padding:8px 0; text-align:right;">
              <span style="color:#34d399; font-weight:700; font-size:14px;">${s.score}/10</span>
              <span style="color:#666; font-size:12px; margin-left:8px;">#${s.rank}</span>
            </td>
          </tr>
        `).join("")}
      </table>`
    : `
      ${divider()}
      <p style="color:#9ca3af; font-size:14px; text-align:center; margin:0 0 8px;">
        You didn't play last week. Jump in this week! 💪
      </p>`;

  // Leaderboard tables
  const leaderboardHtml = topicLeaderboards.map(tl => {
    if (tl.topFive.length === 0) return "";
    return `
      <div style="margin-bottom:20px;">
        <p style="color:#ff6633; font-size:14px; font-weight:700; margin:0 0 8px;">
          ${tl.emoji} ${tl.topic}
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${tl.topFive.map(e => `
            <tr>
              <td style="padding:4px 0; color:#666; font-size:13px; width:24px;">
                ${e.rank <= 3 ? ["🥇", "🥈", "🥉"][e.rank - 1] : `#${e.rank}`}
              </td>
              <td style="padding:4px 8px; color:#f5f5f5; font-size:13px;">
                ${e.name}
              </td>
              <td style="padding:4px 0; text-align:right; color:#34d399; font-weight:700; font-size:13px;">
                ${e.score}/10
              </td>
              <td style="padding:4px 0; text-align:right; color:#666; font-size:12px; width:48px;">
                ${formatTime(e.timeSeconds)}
              </td>
            </tr>
          `).join("")}
        </table>
      </div>`;
  }).join("");

  const bodyHtml = `
    <!-- Hero: New week announcement -->
    <div style="text-align:center; margin-bottom:24px;">
      <p style="font-size:32px; margin:0 0 8px;">🧠</p>
      <h1 style="color:#f5f5f5; font-size:22px; font-weight:800; margin:0 0 8px;">
        Week ${newWeekNumber} Quiz is Live!
      </h1>
      <p style="color:#9ca3af; font-size:14px; margin:0 0 16px;">
        Hey ${firstName}, fresh questions across all topics:
      </p>
      <p style="color:#9ca3af; font-size:13px; margin:0 0 20px;">
        ${topicList}
      </p>
      ${button("Play Now →", playUrl)}
    </div>

    ${userScoresHtml}

    ${divider()}

    <!-- Last week's leaderboards -->
    <p style="color:#f5f5f5; font-size:16px; font-weight:700; margin:0 0 16px;">
      🏆 Week ${lastWeek} Leaderboard
    </p>
    ${leaderboardHtml}

    <div style="text-align:center; margin-top:16px;">
      ${button("View Full Leaderboard", leaderboardUrl, "#333")}
    </div>
  `;

  const subject = `Week ${newWeekNumber} quiz is live! + last week's results 🏆`;

  return {
    subject,
    html: wrapInLayout({ title: subject, bodyHtml, campaign: CAMPAIGN }),
  };
}
