import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getWeekNumber } from "@/lib/week";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic"); // optional — if omitted, show all topics
  const weekParam = searchParams.get("week");
  const email = searchParams.get("email")?.toLowerCase();

  const weekNumber = weekParam ? parseInt(weekParam) : getWeekNumber();

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

  // Get user names for all user_ids
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

  return NextResponse.json({ leaderboard, weekNumber });
}
