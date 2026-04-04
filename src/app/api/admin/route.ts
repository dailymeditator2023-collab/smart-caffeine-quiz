import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getWeekNumber } from "@/lib/week";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();
  const currentWeek = getWeekNumber();

  // 1. Total users
  const { count: totalUsers } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  // 2. Total attempts
  const { count: totalAttempts } = await supabase
    .from("attempts")
    .select("id", { count: "exact", head: true });

  // 3. This week's attempts
  const { count: weekAttempts } = await supabase
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("week_number", currentWeek);

  // 4. All attempts with details (for computing metrics)
  const { data: allAttempts } = await supabase
    .from("attempts")
    .select("email, topic, week_number, score, time_seconds, badges, created_at")
    .order("created_at", { ascending: false });

  // 5. All users with details
  const { data: allUsers } = await supabase
    .from("users")
    .select("email, name, phone, streak, last_played_week, created_at")
    .order("created_at", { ascending: false });

  const attempts = allAttempts || [];
  const users = allUsers || [];

  // --- Compute metrics ---

  // Registrations per day (last 14 days)
  const registrationsByDay: Record<string, number> = {};
  for (const u of users) {
    const day = new Date(u.created_at).toISOString().split("T")[0];
    registrationsByDay[day] = (registrationsByDay[day] || 0) + 1;
  }

  // Attempts per day (last 14 days)
  const attemptsByDay: Record<string, number> = {};
  for (const a of attempts) {
    const day = new Date(a.created_at).toISOString().split("T")[0];
    attemptsByDay[day] = (attemptsByDay[day] || 0) + 1;
  }

  // Average score overall
  const avgScore = attempts.length > 0
    ? Math.round((attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) * 10) / 10
    : 0;

  // Average score per topic
  const topicScores: Record<string, { total: number; count: number }> = {};
  for (const a of attempts) {
    if (!topicScores[a.topic]) topicScores[a.topic] = { total: 0, count: 0 };
    topicScores[a.topic].total += a.score;
    topicScores[a.topic].count += 1;
  }
  const avgScoreByTopic = Object.entries(topicScores).map(([topic, { total, count }]) => ({
    topic,
    avgScore: Math.round((total / count) * 10) / 10,
    totalPlays: count,
  })).sort((a, b) => b.totalPlays - a.totalPlays);

  // Attempts per week
  const attemptsByWeek: Record<number, number> = {};
  for (const a of attempts) {
    attemptsByWeek[a.week_number] = (attemptsByWeek[a.week_number] || 0) + 1;
  }

  // Unique users per week
  const usersByWeek: Record<number, Set<string>> = {};
  for (const a of attempts) {
    if (!usersByWeek[a.week_number]) usersByWeek[a.week_number] = new Set();
    usersByWeek[a.week_number].add(a.email);
  }
  const uniqueUsersByWeek = Object.entries(usersByWeek).map(([week, emails]) => ({
    week: parseInt(week),
    users: emails.size,
    attempts: attemptsByWeek[parseInt(week)] || 0,
  })).sort((a, b) => a.week - b.week);

  // Streak distribution
  const streakDist: Record<number, number> = {};
  for (const u of users) {
    const s = u.streak || 0;
    streakDist[s] = (streakDist[s] || 0) + 1;
  }

  // Topics played per user this week
  const topicsPerUser: Record<string, number> = {};
  for (const a of attempts.filter((a) => a.week_number === currentWeek)) {
    topicsPerUser[a.email] = (topicsPerUser[a.email] || 0) + 1;
  }
  const avgTopicsPerUser = Object.keys(topicsPerUser).length > 0
    ? Math.round((Object.values(topicsPerUser).reduce((a, b) => a + b, 0) / Object.keys(topicsPerUser).length) * 10) / 10
    : 0;

  // Badge distribution
  const badgeCounts: Record<string, number> = {};
  for (const a of attempts) {
    for (const b of a.badges || []) {
      const badgeName = b.replace(/\d+ Week /g, "X Week "); // normalize streak badges
      badgeCounts[badgeName] = (badgeCounts[badgeName] || 0) + 1;
    }
  }

  // Recent registrations (last 20)
  const recentUsers = users.slice(0, 20).map((u) => ({
    name: u.name,
    email: u.email,
    phone: u.phone,
    streak: u.streak,
    created_at: u.created_at,
  }));

  // Recent attempts (last 20)
  const recentAttempts = attempts.slice(0, 20).map((a) => ({
    email: a.email,
    topic: a.topic,
    score: a.score,
    time_seconds: a.time_seconds,
    week_number: a.week_number,
    created_at: a.created_at,
  }));

  // Email click stats
  const { data: emailClicks } = await supabase
    .from("email_clicks")
    .select("campaign, link_type, clicked_at")
    .order("clicked_at", { ascending: false });

  const clicks = emailClicks || [];
  const totalClicks = clicks.length;

  const clicksByCampaign: Record<string, number> = {};
  const clicksByType: Record<string, number> = {};
  const clicksByDay: Record<string, number> = {};

  for (const c of clicks) {
    clicksByCampaign[c.campaign] = (clicksByCampaign[c.campaign] || 0) + 1;
    clicksByType[c.link_type] = (clicksByType[c.link_type] || 0) + 1;
    const day = new Date(c.clicked_at).toISOString().split("T")[0];
    clicksByDay[day] = (clicksByDay[day] || 0) + 1;
  }

  return NextResponse.json({
    currentWeek,
    overview: {
      totalUsers: totalUsers || 0,
      totalAttempts: totalAttempts || 0,
      weekAttempts: weekAttempts || 0,
      avgScore,
      avgTopicsPerUser,
    },
    registrationsByDay,
    attemptsByDay,
    avgScoreByTopic,
    uniqueUsersByWeek,
    streakDist,
    badgeCounts,
    recentUsers,
    recentAttempts,
    emailStats: {
      totalClicks,
      clicksByCampaign,
      clicksByType,
      clicksByDay,
    },
  });
}
