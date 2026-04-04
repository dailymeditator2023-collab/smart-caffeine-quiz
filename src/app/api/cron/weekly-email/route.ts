import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getWeekNumber } from "@/lib/week";
import { sendEmail } from "@/lib/email";
import { buildWeeklySummaryEmail } from "@/lib/email-templates/weekly-summary";
import { getTopicByDbName } from "@/lib/topics";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const currentWeek = getWeekNumber();
  const lastWeek = currentWeek - 1;

  if (lastWeek < 1) {
    return NextResponse.json({ message: "No previous week data yet", sent: 0 });
  }

  // 1. Fetch all users
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, name, email");

  if (usersError || !users) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  // 2. Fetch last week's attempts
  const { data: attempts, error: attError } = await supabase
    .from("attempts")
    .select("user_id, email, topic, score, time_seconds")
    .eq("week_number", lastWeek)
    .order("score", { ascending: false })
    .order("time_seconds", { ascending: true });

  if (attError) {
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }

  // 3. Build per-topic top 5 leaderboards
  const topicGroups = new Map<string, { user_id: string; email: string; score: number; time_seconds: number }[]>();
  for (const a of attempts || []) {
    const list = topicGroups.get(a.topic) || [];
    list.push(a);
    topicGroups.set(a.topic, list);
  }

  // User name lookup
  const nameMap = new Map(users.map(u => [u.id, u.name]));

  const topicLeaderboards = [...topicGroups.entries()].map(([topic, entries]) => {
    const topicInfo = getTopicByDbName(topic);
    return {
      topic: topicInfo?.name || topic,
      emoji: topicInfo?.emoji || "📝",
      topFive: entries.slice(0, 5).map((e, i) => ({
        rank: i + 1,
        name: nameMap.get(e.user_id) || "Anonymous",
        score: e.score,
        timeSeconds: e.time_seconds,
      })),
    };
  });

  // 4. Build per-user score map for personalization
  const userAttempts = new Map<string, { topic: string; emoji: string; score: number; rank: number }[]>();
  for (const [topic, entries] of topicGroups.entries()) {
    const topicInfo = getTopicByDbName(topic);
    entries.forEach((e, idx) => {
      const list = userAttempts.get(e.email) || [];
      list.push({
        topic: topicInfo?.name || topic,
        emoji: topicInfo?.emoji || "📝",
        score: e.score,
        rank: idx + 1,
      });
      userAttempts.set(e.email, list);
    });
  }

  // 5. Send emails in batches of 10
  let sent = 0;
  let failed = 0;
  const batchSize = 10;

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(async (u) => {
        const emailData = buildWeeklySummaryEmail({
          userName: u.name,
          newWeekNumber: currentWeek,
          topicLeaderboards,
          userScores: userAttempts.get(u.email) || [],
        });

        return sendEmail({
          to: u.email,
          subject: emailData.subject,
          html: emailData.html,
        });
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") sent++;
      else {
        failed++;
        console.error("Weekly email failed:", r.reason);
      }
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < users.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return NextResponse.json({
    message: `Weekly emails sent for Week ${currentWeek}`,
    totalUsers: users.length,
    sent,
    failed,
  });
}
