import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getWeekNumber } from "@/lib/week";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const weekParam = searchParams.get("week");
  const email = searchParams.get("email")?.toLowerCase();
  const mode = searchParams.get("mode") || "weekly"; // "weekly" or "alltime"

  const weekNumber = weekParam ? parseInt(weekParam) : getWeekNumber();

  if (mode === "alltime") {
    // All-time leaderboard: aggregate total score across all attempts per user
    const { data: attempts, error } = await supabase
      .from("attempts")
      .select("email, score, time_seconds, topic, user_id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate: sum scores, sum time, count quizzes per user
    const userStats = new Map<string, {
      user_id: string;
      email: string;
      totalScore: number;
      totalTime: number;
      quizCount: number;
    }>();

    for (const a of attempts || []) {
      const existing = userStats.get(a.email);
      if (existing) {
        existing.totalScore += a.score;
        existing.totalTime += a.time_seconds;
        existing.quizCount += 1;
      } else {
        userStats.set(a.email, {
          user_id: a.user_id,
          email: a.email,
          totalScore: a.score,
          totalTime: a.time_seconds,
          quizCount: 1,
        });
      }
    }

    // Sort by total score DESC, then total time ASC
    const sorted = [...userStats.values()]
      .sort((a, b) => b.totalScore - a.totalScore || a.totalTime - b.totalTime)
      .slice(0, 50);

    // Get user names
    const userIds = [...new Set(sorted.map((s) => s.user_id))];
    const { data: users } = await supabase
      .from("users")
      .select("id, name")
      .in("id", userIds);

    const nameMap = new Map((users || []).map((u) => [u.id, u.name]));

    const leaderboard = sorted.map((s, index) => ({
      rank: index + 1,
      name: nameMap.get(s.user_id) || "Anonymous",
      score: s.totalScore,
      quizCount: s.quizCount,
      time_seconds: s.totalTime,
      badges: [],
      topic: "",
      isYou: email ? s.email === email : false,
    }));

    return NextResponse.json({ leaderboard, weekNumber, mode: "alltime" });
  }

  // Weekly leaderboard (default)
  let query = supabase
    .from("attempts")
    .select("email, score, time_seconds, badges, topic, user_id")
    .eq("week_number", weekNumber)
    .order("score", { ascending: false })
    .order("time_seconds", { ascending: true })
    .limit(50);

  if (topic && topic !== "All") {
    query = query.eq("topic", topic);
  }

  const { data: attempts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = [...new Set((attempts || []).map((a) => a.user_id))];
  const { data: users } = await supabase
    .from("users")
    .select("id, name")
    .in("id", userIds);

  const nameMap = new Map((users || []).map((u) => [u.id, u.name]));

  const leaderboard = (attempts || []).map((a, index) => ({
    rank: index + 1,
    name: nameMap.get(a.user_id) || "Anonymous",
    score: a.score,
    time_seconds: a.time_seconds,
    badges: a.badges || [],
    topic: a.topic,
    isYou: email ? a.email === email : false,
  }));

  return NextResponse.json({ leaderboard, weekNumber, mode: "weekly" });
}
