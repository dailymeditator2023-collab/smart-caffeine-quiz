import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getWeekNumber } from "@/lib/week";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();
  const currentWeek = getWeekNumber();

  // For MVP: compute champions from attempts table for all past weeks
  // Get top scorer per topic per week (for weeks before current)
  const { data: attempts, error } = await supabase
    .from("attempts")
    .select("email, topic, week_number, score, time_seconds, user_id")
    .lt("week_number", currentWeek)
    .order("score", { ascending: false })
    .order("time_seconds", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!attempts || attempts.length === 0) {
    return NextResponse.json({ champions: [] });
  }

  // Get user names
  const userIds = [...new Set(attempts.map((a) => a.user_id))];
  const { data: users } = await supabase
    .from("users")
    .select("id, name")
    .in("id", userIds);

  const nameMap = new Map((users || []).map((u) => [u.id, u.name]));

  // Group by week+topic, pick the top scorer (already sorted by score desc, time asc)
  const champMap = new Map<string, {
    week_number: number;
    topic: string;
    user_name: string;
    score: number;
    time_seconds: number;
  }>();

  for (const a of attempts) {
    const key = `${a.week_number}-${a.topic}`;
    if (!champMap.has(key)) {
      champMap.set(key, {
        week_number: a.week_number,
        topic: a.topic,
        user_name: nameMap.get(a.user_id) || "Anonymous",
        score: a.score,
        time_seconds: a.time_seconds,
      });
    }
  }

  // Sort by week descending
  const champions = [...champMap.values()].sort((a, b) => b.week_number - a.week_number);

  return NextResponse.json({ champions });
}
